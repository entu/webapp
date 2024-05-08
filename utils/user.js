export const useUser = () => {
  const { account } = useAccount()
  const token = useLocalStorage('token')
  const user = useLocalStorage('user', {})
  const menuCollapsed = useLocalStorage('menu-collapsed', false)

  const userId = computed(() => account.value?.user?._id)
  const userName = computed(() => account.value?.user?.name)

  return {
    menuCollapsed,
    token,
    user,
    userId,
    userName
  }
}
