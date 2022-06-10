import { useStore } from '@/store'

export async function apiGetEntities (params) {
  return await apiGet('entity', params)
}

export async function apiGetEntity (entityId, params) {
  const { entity } = await apiGet('entity/' + entityId, params)
  return entity
}

export async function apiGet (pathname, params = {}, headers) {
  const store = useStore()

  store.addActiveRequests(1)

  if (store.token && !headers) {
    headers = { Authorization: `Bearer ${store.token}` }
  }

  if (!store.token && store.account) {
    params.account = store.account
  }

  const url = new URL(import.meta.env.VITE_APP_API_URL)
  url.pathname = '/' + pathname
  url.search = new URLSearchParams(params).toString()

  const result = await fetch(url, { headers }).then(response => response.json())

  store.addActiveRequests(-1)

  return result
}

export function getValue (valueList, type = 'string') {
  const store = useStore()
  return valueList?.find(v => v.language === store.locale)?.string || valueList?.find(v => !v.language || valueList?.[0])?.[type]
}
