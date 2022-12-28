export const useUserStore = defineStore('user', () => {
  const account = useLocalStorage('account', null)
  const accounts = useLocalStorage('accounts', [])

  const token = computed(() => accounts.value.find(x => x.account === account.value)?.token)
  const authenticated = computed(() => !!token.value)

  function signOut () {
    account.value = null
    accounts.value = []
  }

  function setAccount (value) {
    account.value = value
  }

  async function getAccounts (key) {
    const authResponse = await apiGet('auth', { account: '' }, { Authorization: `Bearer ${key}` })

    if (!Array.isArray(authResponse)) return

    setAccount(authResponse[0].account)

    accounts.value = authResponse
  }

  return {
    account,
    accounts,
    authenticated,
    getAccounts,
    setAccount,
    signOut,
    token
  }
})
