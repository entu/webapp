export const useAccount = () => {
  const route = useRoute()
  const accounts = useLocalStorage('accounts', [])

  const account = computed(() => accounts.value.find(x => x.account === route.params.account))
  const accountId = computed(() => route.params.account)

  return {
    account,
    accountId,
    accounts
  }
}
