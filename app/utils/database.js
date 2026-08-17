export async function setupNewDatabase (token, database) {
  const runtimeConfig = useRuntimeConfig()
  const { setToken, user } = useUser()
  const { accounts } = useAccount()

  const { db } = await $fetch(`${runtimeConfig.public.apiUrl}/new`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: { database }
  })

  const authResponse = await $fetch(`${runtimeConfig.public.apiUrl}/auth/refresh`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  accounts.value = authResponse.accounts || []
  setToken(authResponse)

  if (authResponse.user) {
    user.value = authResponse.user
  }

  return db
}
