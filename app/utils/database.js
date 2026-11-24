// Creates a database owned by the signed-in user, then refreshes the token so it includes the new database
export async function setupNewDatabase (database) {
  const runtimeConfig = useRuntimeConfig()
  const { token } = useUser()

  await refreshSession()

  const { db } = await $fetch(`${runtimeConfig.public.apiUrl}/new`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token.value}` },
    body: { database }
  })

  await refreshSession({ force: true })

  return db
}
