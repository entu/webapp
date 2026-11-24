export function useUser () {
  const { account, accounts, supportAccounts } = useAccount()

  // Written to localStorage at once, not on the next tick, so another tab waiting to refresh reads the new tokens
  const token = useLocalStorage('token', undefined, { flush: 'sync' })
  const tokenExpiry = useLocalStorage('token-expiry', '', { flush: 'sync' })
  const refreshToken = useLocalStorage('refresh-token', '', { flush: 'sync' })
  const menuCollapsed = useLocalStorage('menu-collapsed', false)
  const listWidth = useLocalStorage('list-width', 0.25)
  const showTable = useLocalStorage('show-table', false)
  const tablePageSize = useLocalStorage('table-page-size', 25)

  const userId = computed(() => account.value?.user?._id)
  const userName = computed(() => account.value?.user?.name)

  // Signed in while a refresh token can renew the access token, or the access token itself is still valid
  const isSignedIn = computed(() => !!token.value && (!!refreshToken.value || new Date(tokenExpiry.value).getTime() > Date.now()))

  // Stores the tokens and databases of a sign-in or refresh response, so all of them always come from the same response
  function setToken (authResponse) {
    token.value = authResponse?.token
    tokenExpiry.value = authResponse?.expires || ''
    refreshToken.value = authResponse?.refreshToken || ''
    accounts.value = authResponse?.accounts || []
    supportAccounts.value = authResponse?.support || []
  }

  // Ends the sign-in on the server too, so its refresh token can't be used even if it was copied
  function logOut () {
    const locale = localStorage.getItem('locale')

    revokeRefreshToken(refreshToken.value)

    localStorage.clear()
    sessionStorage.clear()

    if (locale) {
      localStorage.setItem('locale', locale)
    }

    window.location.href = '/'
  }

  return {
    isSignedIn,
    listWidth,
    logOut,
    menuCollapsed,
    refreshToken,
    setToken,
    showTable,
    tablePageSize,
    token,
    tokenExpiry,
    userId,
    userName
  }
}

// Ends a sign-in on the server without waiting - keepalive lets the request finish while the page navigates away, and a form body keeps it a simple request with no CORS preflight to lose
export function revokeRefreshToken (refreshToken) {
  if (!refreshToken) return

  const runtimeConfig = useRuntimeConfig()

  fetch(`${runtimeConfig.public.apiUrl.replace(/\/$/, '')}/auth/revoke`, {
    method: 'POST',
    keepalive: true,
    body: new URLSearchParams({ token: refreshToken })
  }).catch(() => {})
}
