export const useUser = () => {
  const { account } = useAccount()
  const token = useLocalStorage('token')
  const tokenExpiry = useLocalStorage('token-expiry', '')
  const user = useLocalStorage('user', {})
  const menuCollapsed = useLocalStorage('menu-collapsed', false)
  const listWidth = useLocalStorage('list-width', 0.25)
  const showTable = useLocalStorage('show-table', false)
  const tablePageSize = useLocalStorage('table-page-size', 25)

  const userId = computed(() => account.value?.user?._id)
  const userName = computed(() => account.value?.user?.name)

  function setToken (authResponse) {
    token.value = authResponse?.token
    tokenExpiry.value = authResponse?.expires || ''
  }

  function logOut () {
    const locale = localStorage.getItem('locale')

    localStorage.clear()
    sessionStorage.clear()

    if (locale) {
      localStorage.setItem('locale', locale)
    }

    window.location.href = '/'
  }

  return {
    listWidth,
    logOut,
    menuCollapsed,
    setToken,
    showTable,
    tablePageSize,
    token,
    tokenExpiry,
    user,
    userId,
    userName
  }
}
