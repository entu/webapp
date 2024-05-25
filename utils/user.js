import { update, shutdown } from '@intercom/messenger-js-sdk'

export const useUser = () => {
  const { account, accounts } = useAccount()
  const token = useLocalStorage('token')
  const user = useLocalStorage('user', {})
  const menuCollapsed = useLocalStorage('menu-collapsed', false)

  const userId = computed(() => account.value?.user?._id)
  const userName = computed(() => account.value?.user?.name)

  watch(user, (userValue) => {
    update({
      user_id: userValue.email,
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
    token,
    user,
    userId,
    userName
  }
}
