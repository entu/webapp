export const useUserStore = defineStore('user', () => {
  const account = useLocalStorage('account', null)
  const accounts = useLocalStorage('accounts', [])

  const authenticated = computed(() => accounts.value.some(x => x.account === account.value))
  const _id = computed(() => accounts.value.find(x => x.account === account.value)?._id)
  const name = computed(() => accounts.value.find(x => x.account === account.value)?.name)
  const token = computed(() => accounts.value.find(x => x.account === account.value)?.token)

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
    _id,
    account,
    accounts,
    authenticated,
    getAccounts,
    name,
    setAccount,
    signOut,
    token
  }
})
