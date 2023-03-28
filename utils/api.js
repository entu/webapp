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
  const { accounts, accountId } = useAccount()
  const { token } = useUser()
  const requests = useRequestCounter()

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
  const { language } = useUser()

  return valueList.find(x => x.language === language.value)?.[type] || valueList.find(x => !x.language)?.[type] || valueList?.[0]?.[type]
}

export function humanFileSize (bytes, si = true, dp = 2) {
  if (bytes === null) return

  const { n } = useI18n()
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) return bytes + ' B'

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return n(Math.round(bytes * 10) / 10) + ' ' + units[u]
}
