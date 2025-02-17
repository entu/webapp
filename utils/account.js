export const useAccount = () => {
  const route = useRoute()
  const accounts = useLocalStorage('accounts', [])

  const account = computed(() => {
    const curentAccount = accounts.value.find((x) => x._id === route.params.account)
    if (curentAccount) {
      return curentAccount
    }
    else {
      return {
        _id: route.params.account,
        name: route.params.account
      }
    }
  })
  const accountId = computed(() => route.params.account)

  return {
    account,
    accounts,
    accountId
  }
}
