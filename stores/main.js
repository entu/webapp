export const useMainStore = defineStore('main', () => {
  const { locale } = useI18n({ useScope: 'global' })

  const language = useLocalStorage('language', 'et')
  const menuCollapsed = useLocalStorage('menu', false)
  const requests = ref(0)

  const loading = computed(() => requests.value > 0)

  locale.value = language.value

  watch(() => language.value, (value) => {
    locale.value = value
  })

  return {
    loading,
    language,
    menuCollapsed,
    requests
  }
})
