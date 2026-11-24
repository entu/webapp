// Refresh the token when less than this many milliseconds remain before expiry
const TOKEN_REFRESH_THRESHOLD = 1000 * 60 * 60

// Refreshes run one after another in this tab; a Web Lock does the same across tabs
let refreshQueue = Promise.resolve()

export function useRequestCounter () {
  return useState('requests', () => 0)
}

// Renews the access token with the refresh token - when it is about to expire, after a 401 to `staleToken`, or always with `force`. Refreshes never overlap, even across tabs, as a refresh token presented twice ends the sign-in
export async function refreshSession ({ force = false, staleToken } = {}) {
  if (!force && !staleToken && !isExpiring()) return

  const run = () => runRefresh(force, staleToken)
  const queued = refreshQueue.then(() => navigator.locks ? navigator.locks.request('entu-token-refresh', run) : run())

  refreshQueue = queued.catch(() => {})

  await queued
}

// The tokens as localStorage holds them right now - another tab's refresh shows here at once, before this tab's refs catch up
function storedTokens () {
  return {
    token: localStorage.getItem('token'),
    expiry: localStorage.getItem('token-expiry'),
    refreshToken: localStorage.getItem('refresh-token')
  }
}

// True when the stored access token is about to expire
function isExpiring () {
  const { token, expiry } = storedTokens()

  return !!token && !!expiry && new Date(expiry).getTime() - Date.now() < TOKEN_REFRESH_THRESHOLD
}

// One refresh, once it is this one's turn - it checks again first, as a refresh that ran before it may already have done the job
async function runRefresh (force, staleToken) {
  const runtimeConfig = useRuntimeConfig()
  const { setToken, logOut } = useUser()
  const { token, refreshToken } = storedTokens()

  if (!token) return
  if (staleToken && token !== staleToken) return
  if (!force && !staleToken && !isExpiring()) return

  if (!refreshToken) {
    logOut()

    return
  }

  try {
    const authResponse = await $fetch(`${runtimeConfig.public.apiUrl.replace(/\/$/, '')}/auth/refresh`, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    })

    // The databases come along too, so one gained or lost since sign-in shows up
    setToken(authResponse)
  }
  catch (error) {
    // Only a refused refresh token ends the sign-in; after a network failure the next request tries again
    if (error?.statusCode === 401) {
      logOut()
    }
  }
}

export async function apiGetEntities (params) {
  return await apiRequest('entity', params)
}

export async function apiGetEntity (entityId, props = []) {
  if (!entityId) return

  const { entity } = await apiRequest(`entity/${entityId}`, props.length ? { props: props?.join(',') } : undefined)
  return entity
}

export async function apiGetEntityThumbnail (entityId, size = 200) {
  return await apiRequest(`entity/${entityId}/thumbnail/${size}`)
}

export async function apiGetPropertyThumbnail (propertyId, size = 200) {
  return await apiRequest(`property/${propertyId}/thumbnail/${size}`)
}

export async function apiGetEntityHistory (entityId, { limit, skip } = {}) {
  const params = {}
  if (limit) {
    params.limit = limit
  }
  if (skip) {
    params.skip = skip
  }
  return await apiRequest(`entity/${entityId}/history`, params)
}

export async function apiDeleteEntity (entityId) {
  const { deleted } = await apiRequest(`entity/${entityId}`, {}, {}, 'DELETE')
  return deleted
}

export async function apiDeleteProperty (propertyId) {
  const { deleted } = await apiRequest(`property/${propertyId}`, {}, {}, 'DELETE')
  return deleted
}

export async function apiGetProperty (propertyId) {
  return await apiRequest('property/' + propertyId)
}

export async function apiUpsertEntity (entityId, properties) {
  if (!properties) return

  const url = entityId ? `entity/${entityId}` : 'entity'
  return await apiRequest(url, properties, {}, 'POST')
}

export async function apiRequest (pathname, params = {}, headers = {}, method = 'GET') {
  const requests = useRequestCounter()
  const { token, logOut } = useUser()

  requests.value++

  try {
    await refreshSession()

    const sentToken = token.value

    try {
      return await sendRequest(pathname, params, headers, method, sentToken)
    }
    catch (error) {
      if (error?.statusCode !== 401 || !sentToken) {
        throw error
      }

      // An IP-bound token stops working when the network changes, so a 401 gets one refresh and retry before signing out
      await refreshSession({ staleToken: sentToken })

      // No new token means the refresh failed - a refused one has signed out already, a network failure keeps the sign-in
      const freshToken = storedTokens().token

      if (!freshToken || freshToken === sentToken) {
        throw error
      }

      return await sendRequest(pathname, params, headers, method, freshToken).catch((retryError) => {
        if (retryError?.statusCode === 401) {
          logOut()
        }

        throw retryError
      })
    }
  }
  finally {
    requests.value--
  }
}

// Sends one API request in the active database with the given access token
async function sendRequest (pathname, params, headers, method, accessToken) {
  const runtimeConfig = useRuntimeConfig()
  const { accountId } = useAccount()

  const url = new URL(runtimeConfig.public.apiUrl)
  const base = url.pathname.replace(/\/$/, '')

  if (accountId.value) {
    url.pathname = `${base}/${accountId.value}/${pathname || ''}`
  }
  else if (pathname) {
    url.pathname = `${base}/${pathname}`
  }

  const query = method === 'GET'
    ? Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v]))
    : undefined

  return await $fetch(url.toString(), {
    method,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}`, ...headers } : headers,
    ...(query
      ? { query }
      : { body: params })
  })
}

function resolveDate (defaultStr) {
  const match = defaultStr.match(/^([+-])(\d+)([hdwmy])$/)

  if (match) {
    const n = Number.parseInt(match.at(2), 10) * (match.at(1) === '+' ? 1 : -1)
    const d = new Date()

    if (match.at(3) === 'h') {
      d.setHours(d.getHours() + n)
    }
    else if (match.at(3) === 'd') {
      d.setDate(d.getDate() + n)
    }
    else if (match.at(3) === 'w') {
      d.setDate(d.getDate() + n * 7)
    }
    else if (match.at(3) === 'm') {
      d.setMonth(d.getMonth() + n)
    }
    else if (match.at(3) === 'y') {
      d.setFullYear(d.getFullYear() + n)
    }

    return d.getTime()
  }

  return new Date(defaultStr).getTime()
}

export function makeDefaultValue (type, defaultStr) {
  if (type === 'number') {
    return { number: Number(defaultStr) }
  }
  if (type === 'boolean') {
    return { boolean: defaultStr.toLowerCase() === 'true' }
  }
  if (type === 'date') {
    return { date: resolveDate(defaultStr) }
  }
  if (type === 'datetime') {
    return { datetime: resolveDate(defaultStr) }
  }
  if (type === 'reference') {
    return { reference: defaultStr }
  }
  return { string: String(defaultStr) }
}

export function getValue (valueList = [], type = 'string') {
  const locale = localStorage.getItem('locale')

  return valueList?.find((x) => x.language === locale)?.[type]
    ?? valueList?.find((x) => !x.language)?.[type]
    ?? valueList?.at(0)?.[type]
}

export function propsSorter (a, b) {
  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) {
    return -1
  }
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) {
    return 1
  }

  if (!a.ordinal && b.ordinal) {
    return -1
  }
  if (a.ordinal && !b.ordinal) {
    return 1
  }

  if (!a.name || a.name < b.name) {
    return -1
  }
  if (!b.name || a.name > b.name) {
    return 1
  }

  return 0
}

export function propertyValuesSorter (a, b) {
  if (a.language && b.language && a.language < b.language) {
    return -1
  }
  if (a.language && b.language && a.language > b.language) {
    return 1
  }

  if (!a.language && b.language) {
    return -1
  }
  if (a.language && !b.language) {
    return 1
  }

  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) {
    return -1
  }
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) {
    return 1
  }

  if (!a.ordinal && b.ordinal) {
    return -1
  }
  if (a.ordinal && !b.ordinal) {
    return 1
  }

  if (a._id && b._id && a._id < b._id) {
    return -1
  }
  if (a._id && b._id && a._id > b._id) {
    return 1
  }

  if (!a._id && b._id) {
    return -1
  }
  if (a._id && !b._id) {
    return 1
  }

  return 0
}

export function queryStringToObject (q) {
  if (!q) {
    return {}
  }

  const query = q.split('&')

  const params = {}
  for (const parameter of query) {
    const [key, value] = parameter.split('=')
    params[key] = value
  }

  return params
}

export async function apiDuplicateEntity (entityId, count = 1, ignoredProperties = []) {
  return await apiRequest(`entity/${entityId}/duplicate`, { count, ignoredProperties }, {}, 'POST')
}

export async function apiAiChat (messages) {
  return await apiRequest('ai/chat', { messages }, {}, 'POST')
}

export async function apiAiExecute (operations) {
  return await apiRequest('ai/execute', { operations }, {}, 'POST')
}
