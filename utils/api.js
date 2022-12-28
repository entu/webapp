import { useMainStore } from '~/stores/main'
import { useUserStore } from '~/stores/user'

export async function apiGetEntities (params) {
  return await apiGet('entity', params)
}

export async function apiGetEntity (entityId, params) {
  const { entity } = await apiGet('entity/' + entityId, params)
  return entity
}

export async function apiGet (pathname, params = {}, headers) {
  const runtimeConfig = useRuntimeConfig()

  const mainStore = useMainStore()
  const userStore = useUserStore()
  const { requests } = storeToRefs(mainStore)
  const { account, token } = storeToRefs(userStore)

  requests.value++

  if (token.value) {
    headers = { Authorization: `Bearer ${token.value}`, ...headers }
  } else {
    params = { account: account.value, ...params }
  }

  const url = new URL(runtimeConfig.public.apiUrl)
  url.pathname = '/' + pathname
  url.search = new URLSearchParams(params).toString()

  const result = await fetch(url, { headers }).then((response) => {
    if (!response.ok && response.status === 401) {
      userStore.signOut()
    }

    return response.json()
  })

  requests.value--

  return result
}

export function getValue (valueList = [], type = 'string') {
  const mainStore = useMainStore()
  const { locale } = storeToRefs(mainStore)

  return valueList.find(x => x.language === locale.value)?.[type] || valueList.find(x => !x.language)?.[type] || valueList?.[0]?.[type]
}
