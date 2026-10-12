// Finishes a browser sign-in with the session key the API returned; resolves to { to } or { error, to? } and never throws
export async function completeSignIn (key, invite) {
  const runtimeConfig = useRuntimeConfig()
  const { accounts } = useAccount()
  const { setToken, token, tokenExpiry } = useUser()

  const nextPage = useLocalStorage('next', {})
  const next = nextPage.value || {}
  const newDatabase = invite ? undefined : sessionStorage.getItem('new-database')
  const signal = takePasskeySignal()

  // Every outcome ends this sign-in, so nothing it stored may steer a later one; a failed database creation puts its name back
  nextPage.value = {}
  sessionStorage.removeItem('new-database')

  const pendingInvite = invite ? readInvite(invite) : undefined

  if (!key || (invite && !pendingInvite)) {
    return { error: invite ? 'invite' : 'signIn' }
  }

  const authAccount = pendingInvite?.db || next.path?.split('/').filter((x) => x !== 'new').at(1)

  // Adding a login method to yourself must not replace the session you started it from
  const isSignedIn = !!token.value && new Date(tokenExpiry.value).getTime() > Date.now()
  const keepSession = isSignedIn && !!pendingInvite && accounts.value.find((x) => x._id === pendingInvite.db)?.user?._id === pendingInvite.entityId

  let authResponse

  try {
    // Plain $fetch, so a stored token is never refreshed or signed out while this one is exchanged
    authResponse = await $fetch(`${runtimeConfig.public.apiUrl.replace(/\/$/, '')}/auth`, {
      query: { ...(authAccount ? { db: authAccount } : {}), ...(invite ? { invite } : {}) },
      headers: { Authorization: `Bearer ${key}` }
    })
  }
  catch (error) {
    return { error: invite && error?.statusCode === 400 ? 'invite' : 'signIn' }
  }

  await signalPasskeyUserDetails(signal, authResponse.rename)

  if (keepSession) {
    const to = `/${pendingInvite.db}/${pendingInvite.entityId}`

    return authResponse.conflict ? { error: 'conflict', to } : { to }
  }

  setToken(authResponse)

  if (authResponse.conflict) {
    return { error: 'conflict', to: '/' }
  }

  if (newDatabase) {
    return await createNewDatabase(authResponse.token, newDatabase)
  }

  const newUser = authResponse.accounts?.find((x) => x._id === authAccount)?.user

  if (newUser?.new) {
    return { to: { path: `/${authAccount}/${newUser._id}`, hash: '#edit' } }
  }

  if (pendingInvite && authResponse.accounts?.some((x) => x._id === pendingInvite.db)) {
    return { to: `/${pendingInvite.db}` }
  }

  if (!invite && next.path && next.path !== '/') {
    return { to: { path: next.path, query: next.query } }
  }

  return { to: authResponse.accounts?.length > 0 ? '/' : '/new' }
}

// Creates the database chosen on the signup page; a failure returns there with the name and error to show
async function createNewDatabase (sessionToken, database) {
  try {
    const db = await setupNewDatabase(sessionToken, database)

    return { to: `/${db}` }
  }
  catch (error) {
    sessionStorage.setItem('new-database', database)
    sessionStorage.setItem('new-database-error', error?.data?.statusMessage || error?.message)

    return { to: '/new' }
  }
}

// The database and person an invite token names, read without verifying; undefined when it is not a readable invite
function readInvite (invite) {
  try {
    const payload = JSON.parse(atob(invite.split('.').at(1).replaceAll('-', '+').replaceAll('_', '/')))

    if (typeof payload?.db !== 'string' || typeof payload?.entityId !== 'string') return

    return { db: payload.db, entityId: payload.entityId }
  }
  catch {
    return
  }
}
