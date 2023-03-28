
export const useUser = () => {
  const { account } = useAccount()
  const language = useLocalStorage('language', 'en')
  const menuCollapsed = useLocalStorage('menu-collapsed', false)

  const userId = computed(() => account.value?._id)
  const userName = computed(() => account.value?.name)
  const token = computed(() => account.value?.token)

  return {
    language,
    menuCollapsed,
    token,
    userId,
    userName
  }
}
