export function useRequestCounter () {
  return useState('requests', () => 0)
}

export async function apiGetEntities (params) {
  return await apiRequest('entity', params)
}

export async function apiGetEntity (entityId, props = []) {
  const { entity } = await apiRequest(`entity/${entityId}`, props.length ? { props: props?.join(',') } : undefined)
  return entity
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
  const runtimeConfig = useRuntimeConfig()
  const requests = useRequestCounter()

  const { accountId } = useAccount()
  const { token, logOut } = useUser()

  requests.value++

  if (token.value) {
    headers = { Authorization: `Bearer ${token.value}`, ...headers }
  }

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

  const result = await $fetch(url.toString(), {
    method,
    headers,
    ...(query
      ? { query }
      : { body: params }),
    onResponseError ({ response }) {
      if (response.status === 401) {
        logOut()
      }
    }
  })

  requests.value--

  return result
}

function resolveDate (defaultStr) {
  const match = defaultStr.match(/^([+-])(\d+)([hdwmy])$/)

  if (match) {
    const n = parseInt(match.at(2), 10) * (match.at(1) === '+' ? 1 : -1)
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
  if (type === 'number') return { number: Number(defaultStr) }
  if (type === 'boolean') return { boolean: defaultStr.toLowerCase() === 'true' }
  if (type === 'date') return { date: resolveDate(defaultStr) }
  if (type === 'datetime') return { datetime: resolveDate(defaultStr) }
  if (type === 'reference') return { reference: defaultStr }
  return { string: String(defaultStr) }
}

export function getValue (valueList = [], type = 'string') {
  const locale = localStorage.getItem('locale')

  return valueList?.find((x) => x.language === locale)?.[type]
    || valueList?.find((x) => !x.language)?.[type]
    || valueList?.at(0)?.[type]
}

export function propsSorter (a, b) {
  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) return -1
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) return 1

  if (!a.ordinal && b.ordinal) return -1
  if (a.ordinal && !b.ordinal) return 1

  if (!a.name || a.name < b.name) return -1
  if (!b.name || a.name > b.name) return 1

  return 0
}

export function propertyValuesSorter (a, b) {
  if (a.language && b.language && a.language < b.language) return -1
  if (a.language && b.language && a.language > b.language) return 1

  if (!a.language && b.language) return -1
  if (a.language && !b.language) return 1

  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) return -1
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) return 1

  if (!a.ordinal && b.ordinal) return -1
  if (a.ordinal && !b.ordinal) return 1

  if (a._id && b._id && a._id < b._id) return -1
  if (a._id && b._id && a._id > b._id) return 1

  if (!a._id && b._id) return -1
  if (a._id && !b._id) return 1

  return 0
}

export function queryStringToObject (q) {
  if (!q) return {}

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
