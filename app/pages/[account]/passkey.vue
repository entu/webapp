<script setup>
import { NButton, NSpin, NCard } from 'naive-ui'
import { startRegistration, browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser'

const { t } = useI18n()
const { token } = useUser()
const { accountId } = useAccount()

const canUsePasskey = ref(false)
const isRegistering = ref(false)
const registerError = ref(false)

onMounted(async () => {
  useHead({ title: t('title') })

  // Redirect to login if not authenticated
  if (!token.value) {
    await navigateTo('/')

    return
  }

  // Redirect if no account context
  if (!accountId.value) {
    await navigateTo('/')

    return
  }

  // Check if WebAuthn is supported and available
  if (!browserSupportsWebAuthn()) return

  try {
    canUsePasskey.value = await platformAuthenticatorIsAvailable()
  }
  catch {
    canUsePasskey.value = false
  }
})

async function registerPasskey () {
  registerError.value = false

  try {
    // Get registration options from server
    const options = await apiRequest('passkey')

    // Show spinner during registration
    isRegistering.value = true

    // startRegistration handles WebAuthn API calls and base64url conversions
    const credential = await startRegistration(options)

    // Complete registration with device name
    await apiRequest('passkey', {
      ...credential,
      expectedChallenge: options.challenge,
      deviceName: getDeviceName()
    }, {}, 'POST')

    // Success - go back to previous page
    window.history.back()
  }
  catch (error) {
    console.error('Passkey registration failed:', error)
    registerError.value = true
  }
  finally {
    isRegistering.value = false
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
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-white p-4">
    <div class="w-full max-w-fit space-y-6">
      <n-spin
        v-if="isRegistering"
        class="size-full text-center"
        show
        :delay="1000"
      />

      <template v-else>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ t('title') }}
          </h1>
        </div>

        <p
          v-if="!canUsePasskey"
          class="text-center text-red-800"
        >
          {{ t('notSupported') }}
        </p>

        <div
          v-else
          class="space-y-6"
        >
          <n-card>
            <p class="max-w-sm text-sm text-gray-700">
              {{ t('description') }}
            </p>
          </n-card>

          <div class="space-y-4 text-center">
            <n-button
              type="primary"
              size="large"
              block
              @click="registerPasskey"
            >
              {{ t('registerButton') }}
            </n-button>

            <p
              v-if="registerError"
              class="text-sm text-red-800"
            >
              {{ t('registerError') }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Register Passkey
    notSupported: Passkeys are not supported on this device
    description: Passkeys let you sign in to Entu securely using your fingerprint, face recognition, or device PIN. No passwords needed—just use your device's built-in security.
    registerButton: Register New Passkey
    registerError: Registration failed. Please try again.
  et:
    title: Registreeri turvavõti
    notSupported: Turvavõti ei ole sellel seadmel toetatud
    description: Turvavõti võimaldab sul Entusse turvaliselt sisse logida sõrmejälje, näotuvastuse või seadme PIN-koodiga. Paroolid pole vajalikud—kasuta lihtsalt oma seadme sisseehitatud turvalisust.
    registerButton: Registreeri uus turvavõti
    registerError: Registreerimine ebaõnnestus. Palun proovi uuesti.
</i18n>
