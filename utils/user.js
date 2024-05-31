import { update, shutdown } from '@intercom/messenger-js-sdk'

export const useUser = () => {
  const { account, accounts } = useAccount()
  const token = useLocalStorage('token')
  const user = useLocalStorage('user', {})
  const menuCollapsed = useLocalStorage('menu-collapsed', false)
  const tablePageSize = useLocalStorage('table-page-size', 25)

  const userId = computed(() => account.value?.user?._id)
  const userName = computed(() => account.value?.user?.name)

  watch(user, (userValue) => {
    update({
      user_id: userValue.email,
      user_hash: userValue.hash,
      name: userValue.name,
      email: userValue.email
    })
  }, { deep: true })

  function logOut () {
    accounts.value = undefined
    token.value = undefined
    user.value = undefined

    shutdown()
  }

  return {
    logOut,
    menuCollapsed,
    tablePageSize,
    token,
    user,
    userId,
    userName
  }
}
