export function useRequestCounter () {
  return useState('requests', () => 0)
}

export async function apiGetEntities (params) {
  return await apiGet('entity', params)
}

export async function apiGetEntity (entityId, params) {
  const { entity } = await apiGet('entity/' + entityId, params)
  return entity
}

export async function apiGetProperty (propertyId, params) {
  return await apiGet('property/' + propertyId, params)
}

export async function apiGet (pathname, params = {}, headers) {
  const runtimeConfig = useRuntimeConfig()
  const requests = useRequestCounter()

  const { accounts, accountId } = useAccount()
  const { token } = useUser()

  requests.value++

  if (token.value) {
    headers = { Authorization: `Bearer ${token.value}`, ...headers }
  } else {
    params = { account: accountId.value, ...params }
  }

  const url = new URL(runtimeConfig.public.apiUrl)
  url.pathname = '/' + pathname
  url.search = new URLSearchParams(params).toString()

  const result = await fetch(url, { headers }).then((response) => {
    if (!response.ok && response.status === 401) accounts.value = []

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
