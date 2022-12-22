export const useUserStore = defineStore('user', () => {
  const route = useRoute()

  const accounts = ref([])

  const account = computed(() => route.params.account)
  const authenticated = computed(() => accounts.value.some(a => a.account === route.params.account))
  const token = computed(() => accounts.value.find(a => a.account === route.params.account)?.token)

  function signOut () {
    accounts.value = []
  }

  async function getAccounts (key) {
    accounts.value = await apiGet('auth', {}, { Authorization: `Bearer ${key}` })
  }

  return {
    account,
    accounts,
    authenticated,
    getAccounts,
    signOut,
    token
  }
}, {
  persist: {
    storage: persistedState.sessionStorage,
    paths: ['accounts']
  }
})
