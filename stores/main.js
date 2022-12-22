export const useMainStore = defineStore('main', () => {
  const locale = ref('et')
  const requests = ref(0)

  const loading = computed(() => requests.value > 0)

  return {
    requests,
    loading,
    locale
  }
}, {
  persist: {
    storage: persistedState.localStorage,
    paths: ['locale']
  }
})
