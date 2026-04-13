export const useUser = () => {
  const { account, accounts } = useAccount()
  const token = useLocalStorage('token')
  const user = useLocalStorage('user', {})
  const menuCollapsed = useLocalStorage('menu-collapsed', false)
  const listWidth = useLocalStorage('list-width', 0.25)
  const tablePageSize = useLocalStorage('table-page-size', 25)

  const userId = computed(() => account.value?.user?._id)
  const userName = computed(() => account.value?.user?.name)

  function logOut () {
    accounts.value = undefined
    token.value = undefined
    user.value = undefined
  }

  return {
    listWidth,
    logOut,
    menuCollapsed,
    tablePageSize,
    token,
    user,
    userId,
    userName
  }
}
