export const useMainStore = defineStore('main', () => {
  const locale = ref('et')
  const menuCollapsed = ref(false)
  const requests = ref(0)

  const loading = computed(() => requests.value > 0)

  return {
    loading,
    locale,
    menuCollapsed,
    requests
  }
}, {
  persist: {
    storage: persistedState.localStorage,
    paths: ['locale', 'menuCollapsed']
  }
})
