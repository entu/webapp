import { useMainStore } from '~/stores/main'
import { useUserStore } from '~/stores/user.client'

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

  if (token.value && !headers) {
    headers = { Authorization: `Bearer ${token.value}` }
  }

  if (!token.value && account.value) {
    params.account = account.value
  }

  const url = new URL(runtimeConfig.public.apiUrl)
  url.pathname = '/' + pathname
  url.search = new URLSearchParams(params).toString()

  const result = await fetch(url, { headers }).then(response => {
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

  return valueList.find(v => v.language === locale)?.[type] || valueList.find(v => !v.language)?.[type] || valueList?.[0]?.[type]
}
