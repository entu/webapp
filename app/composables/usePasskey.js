export const usePasskey = () => {
  const isSupported = ref(false)
  const isAvailable = ref(false)

  onMounted(async () => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      isSupported.value = true

      // Check if platform authenticator is available
      try {
        isAvailable.value = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      }
      catch (error) {
        console.warn('Error checking platform authenticator availability:', error)
        isAvailable.value = false
      }
    }
  })

  async function register (deviceName) {
    if (!isSupported.value) {
      throw new Error('Passkeys not supported')
    }

    try {
      // Get registration options
      const options = await apiRequest('auth/passkey/register', {}, {}, 'GET')

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: options
      })

      if (!credential) {
        throw new Error('Registration cancelled')
      }

      // Complete registration
      const result = await apiRequest('auth/passkey/register', {
        id: credential.id,
        rawId: credential.id,
        response: {
          clientDataJSON: credential.response.clientDataJSON,
          attestationObject: credential.response.attestationObject
        },
        type: credential.type,
        expectedChallenge: options.challenge,
        deviceName: deviceName || getDeviceName()
      }, {}, 'POST')

      return result
    }
    catch (error) {
      console.error('Passkey registration failed:', error)
      throw error
    }
  }

  async function authenticate () {
    if (!isSupported.value) {
      throw new Error('Passkeys not supported')
    }

    try {
      // Get authentication options
      const options = await $fetch('/api/auth/passkey/authenticate')

      // Get credential
      const credential = await navigator.credentials.get({
        publicKey: options
      })

      if (!credential) {
        throw new Error('Authentication cancelled')
      }

      // Complete authentication
      const result = await $fetch('/api/auth/passkey/authenticate', {
        method: 'POST',
        body: {
          id: credential.id,
          rawId: credential.id,
          response: {
            clientDataJSON: credential.response.clientDataJSON,
            authenticatorData: credential.response.authenticatorData,
            signature: credential.response.signature
          },
          type: credential.type,
          expectedChallenge: options.challenge
        }
      })

      return result
    }
    catch (error) {
      console.error('Passkey authentication failed:', error)
      throw error
    }
  }

  function getDeviceName () {
    const ua = navigator.userAgent
    if (ua.includes('iPhone')) return 'iPhone'
    if (ua.includes('iPad')) return 'iPad'
    if (ua.includes('Mac')) return 'Mac'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('Windows')) return 'Windows PC'
    return 'Unknown Device'
  }

  return {
    isSupported,
    isAvailable,
    register,
    authenticate
  }
}
