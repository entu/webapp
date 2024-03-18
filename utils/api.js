export function useRequestCounter () {
  return useState('requests', () => 0)
}

export async function apiGetEntities (params) {
  return await apiRequest('entity', params)
}

export async function apiGetEntity (entityId, props = []) {
  const { entity } = await apiRequest('entity/' + entityId, props.length
    ? {
        props: props?.join(',')
      }
    : undefined)
  return entity
}

export async function apiDeleteEntity (entityId) {
  const { deleted } = await apiRequest('entity/' + entityId, {}, {}, 'DELETE')
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

  const { accounts, accountId } = useAccount()
  const { token } = useUser()
  let body = null

  requests.value++

  if (accountId.value) {
    params = { account: accountId.value, ...params }
  }

  if (token.value) {
    headers = { Authorization: `Bearer ${token.value}`, ...headers }
  }

  const url = new URL(runtimeConfig.public.apiUrl)
  url.pathname = `${url.pathname}/${pathname}`

  if (method === 'GET') {
    url.search = new URLSearchParams(params).toString()
  } else {
    headers = { 'Content-Type': 'application/json', ...headers }
    body = JSON.stringify(params)
  }

  const result = await fetch(url, { method, headers, body }).then((response) => {
    if (!response.ok && response.status === 401) {
      accounts.value = undefined
      token.value = undefined
    }

    return response.json()
  })

  requests.value--

  return result
}

export function getValue (valueList = [], type = 'string') {
  const locale = localStorage.getItem('locale')

  return valueList.find(x => x.language === locale)?.[type] || valueList.find(x => !x.language)?.[type] || valueList?.at(0)?.[type]
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
