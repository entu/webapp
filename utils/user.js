export const useUser = () => {
  const { account } = useAccount()
  const token = useLocalStorage('token')
  const menuCollapsed = useLocalStorage('menu-collapsed', false)

  const userId = computed(() => account.value?.user?._id)
  const userName = computed(() => account.value?.user?.name)

  return {
    menuCollapsed,
    token,
    userId,
    userName
  }
}
