export function useUser () {
  const { account, accounts } = useAccount()
  const token = useLocalStorage('token')
  const tokenExpiry = useLocalStorage('token-expiry', '')
  const menuCollapsed = useLocalStorage('menu-collapsed', false)
  const listWidth = useLocalStorage('list-width', 0.25)
  const showTable = useLocalStorage('show-table', false)
  const tablePageSize = useLocalStorage('table-page-size', 25)

  const userId = computed(() => account.value?.user?._id)
  const userName = computed(() => account.value?.user?.name)

  // Stores the token and databases of a sign-in or refresh response, so both always come from the same response
  function setToken (authResponse) {
    token.value = authResponse?.token
    tokenExpiry.value = authResponse?.expires || ''
    accounts.value = authResponse?.accounts || []
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
    userId,
    userName
  }
}
