export const useMainStore = defineStore('main', () => {
  const locale = useLocalStorage('locale', 'et')
  const menuCollapsed = useLocalStorage('menu', false)
  const requests = ref(0)

  const loading = computed(() => requests.value > 0)

  return {
    loading,
    locale,
    menuCollapsed,
    requests
  }
})
