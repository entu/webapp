import * as Sentry from '@sentry/nuxt'
import { browserSupportsWebAuthn, platformAuthenticatorIsAvailable, startAuthentication, startRegistration } from '@simplewebauthn/browser'

// Carries the passkey's relying party and user handle from a passkey page to the sign-in callback, for the Signal API
const SIGNAL_KEY = 'passkey-signal'

// The WebAuthn step of the passkey sign-in and creation pages, ending at the API callback as oauth.ee does for other providers
export function usePasskey () {
  const route = useRoute()

  const isSupported = ref(false)
  const isWorking = ref(false)
  const hasError = ref(false)
  const isCancelled = ref(false)

  // Checks this device can use a passkey; false also when the check itself fails
  async function checkSupport () {
    if (!browserSupportsWebAuthn()) {
      isSupported.value = false

      return false
    }

    try {
      isSupported.value = await platformAuthenticatorIsAvailable()
    }
    catch {
      isSupported.value = false
    }

    return isSupported.value
  }

  // Signs in with a passkey already stored on this device
  async function signIn () {
    hasError.value = false

    try {
      const { challengeToken, ...optionsJSON } = await passkeyApi('auth/passkey/options')

      isWorking.value = true

      const credential = await startAuthentication({ optionsJSON })

      storeSignal(optionsJSON.rpId, credential.response?.userHandle)

      const { code } = await passkeyApi('auth/passkey', { ...credential, challengeToken, rename: canRenamePasskey(), state: route.query.state })
        .catch((error) => {
          signalUnknownCredential(error, optionsJSON.rpId, credential.id)

          throw error
        })

      await goToCallback(code)
    }
    catch (error) {
      fail(error)
    }
  }

  // Creates a new passkey on this device and signs in with it
  async function register () {
    hasError.value = false

    try {
      const { challengeToken, ...optionsJSON } = await passkeyApi('auth/passkey/register/options')

      isWorking.value = true

      const credential = await startRegistration({ optionsJSON })

      storeSignal(optionsJSON.rp?.id, optionsJSON.user?.id)

      const { code } = await passkeyApi('auth/passkey/register', { ...credential, challengeToken, deviceName: guessDeviceName(), rename: canRenamePasskey(), state: route.query.state })

      await goToCallback(code)
    }
    catch (error) {
      fail(error)
    }
  }

  // Hands the code to the API callback, which returns to the webapp with a session key like any other provider
  async function goToCallback (code) {
    const url = new URL(apiUrl('auth/callback'))

    url.searchParams.set('code', code)
    url.searchParams.set('state', route.query.state)

    await navigateTo(url.toString(), { external: true })
  }

  // Shows the error state and reports anything but a cancelled, blocked or timed-out passkey prompt
  function fail (error) {
    isCancelled.value = error?.name === 'NotAllowedError'

    if (!isCancelled.value) {
      Sentry.captureException(error)
    }

    sessionStorage.removeItem(SIGNAL_KEY)

    hasError.value = true
    isWorking.value = false
  }

  return {
    checkSupport,
    hasError,
    isCancelled,
    isSupported,
    isWorking,
    register,
    signIn
  }
}

// Reads and clears what a passkey page stored for the Signal API, so it never outlives one sign-in
export function takePasskeySignal () {
  const stored = sessionStorage.getItem(SIGNAL_KEY)

  sessionStorage.removeItem(SIGNAL_KEY)

  try {
    return stored ? JSON.parse(stored) : undefined
  }
  catch {
    return
  }
}

// Renames the passkey in the password manager to the name the API asked for - it asks once, and again only when the name changes
export async function signalPasskeyUserDetails (signal, name) {
  if (!name || !signal?.rpId || !signal?.userId || !canRenamePasskey()) return

  try {
    await PublicKeyCredential.signalCurrentUserDetails({ rpId: signal.rpId, userId: signal.userId, name, displayName: name })
  }
  catch {
    // The Signal API is a hint to the passkey manager - a refusal changes nothing for the sign-in
  }
}

// True when this browser can rename a passkey in its password manager, so the API may ask it to
function canRenamePasskey () {
  return typeof globalThis.PublicKeyCredential?.signalCurrentUserDetails === 'function'
}

// Tells the passkey manager a passkey Entu no longer knows, so it can hide or remove it
async function signalUnknownCredential (error, rpId, credentialId) {
  if (error?.data?.statusMessage !== 'Authentication verification failed' || !rpId || !credentialId) return
  if (typeof globalThis.PublicKeyCredential?.signalUnknownCredential !== 'function') return

  try {
    await PublicKeyCredential.signalUnknownCredential({ rpId, credentialId })
  }
  catch {
    // The Signal API is a hint to the passkey manager - a refusal changes nothing for the sign-in
  }
}

// Remembers the passkey's relying party and user handle until the callback knows the person name
function storeSignal (rpId, userId) {
  if (!rpId || !userId) {
    sessionStorage.removeItem(SIGNAL_KEY)

    return
  }

  sessionStorage.setItem(SIGNAL_KEY, JSON.stringify({ rpId, userId }))
}

// Calls a public passkey route with plain $fetch, so a stored token is never refreshed or signed out mid-login
async function passkeyApi (pathname, body) {
  return await $fetch(apiUrl(pathname), body ? { method: 'POST', body } : {})
}

// Absolute URL of an API route
function apiUrl (pathname) {
  const runtimeConfig = useRuntimeConfig()

  return `${runtimeConfig.public.apiUrl.replace(/\/$/, '')}/${pathname}`
}

// A label for the new passkey, so a person with several can tell them apart
function guessDeviceName () {
  const ua = navigator.userAgent

  if (ua.includes('iPhone')) {
    return 'iPhone'
  }
  if (ua.includes('iPad')) {
    return 'iPad'
  }
  if (ua.includes('Mac')) {
    return 'Mac'
  }
  if (ua.includes('Android')) {
    return 'Android'
  }
  if (ua.includes('Windows')) {
    return 'Windows PC'
  }

  return 'Unknown Device'
}
