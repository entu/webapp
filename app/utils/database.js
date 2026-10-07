// Creates a database owned by the token's sign-in, then refreshes the token so it includes the new database
export async function setupNewDatabase (token, database) {
  const runtimeConfig = useRuntimeConfig()
  const { setToken } = useUser()

  const { db } = await $fetch(`${runtimeConfig.public.apiUrl}/new`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: { database }
  })

  const authResponse = await $fetch(`${runtimeConfig.public.apiUrl}/auth/refresh`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  setToken(authResponse)

  return db
}
