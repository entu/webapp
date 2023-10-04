export const useUser = () => {
  const { account } = useAccount()
  const menuCollapsed = useLocalStorage('menu-collapsed', false)

  const userId = computed(() => account.value?._id)
  const userName = computed(() => account.value?.name)
  const token = computed(() => account.value?.token)

  return {
    menuCollapsed,
    token,
    userId,
    userName
  }
}
