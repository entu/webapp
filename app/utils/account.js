export function useAccount () {
  const route = useRoute()
  const accounts = useLocalStorage('accounts', [])

  // Databases whose owner granted Entu support access - listed apart, as access to them ends at `until`
  const supportAccounts = useLocalStorage('support-accounts', [])

  const account = computed(() => {
    const curentAccount = accounts.value.find((x) => x._id === route.params.account)
    if (curentAccount) {
      return curentAccount
    }

    const supportAccount = supportAccounts.value.find((x) => x._id === route.params.account && new Date(x.until).getTime() > Date.now())
    if (supportAccount) {
      return { ...supportAccount, support: true }
    }

    return {
      _id: route.params.account,
      name: route.params.account
    }
  })
  const accountId = computed(() => route.params.account)
  const isSupport = computed(() => account.value?.support === true)

  const showMobileMenu = useState('showMobileMenu', () => false)

  return {
    account,
    accounts,
    accountId,
    isSupport,
    showMobileMenu,
    supportAccounts
  }
}
