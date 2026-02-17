<script setup>
import { NButton, NSpin, NCard } from 'naive-ui'
import { startAuthentication, browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser'

const { t } = useI18n()
const { token } = useUser()
const { accounts } = useAccount()

const canUsePasskey = ref(false)
const isAuthenticating = ref(false)
const authError = ref(false)

onMounted(async () => {
  useHead({ title: t('title') })

  useAnalytics('auth_passkey')

  // Check if WebAuthn is supported and available
  if (!browserSupportsWebAuthn()) return

  try {
    canUsePasskey.value = await platformAuthenticatorIsAvailable()

    // Automatically start authentication if available
    if (canUsePasskey.value) {
      await authenticateWithPasskey()
    }
  }
  catch {
    canUsePasskey.value = false
  }
})

async function authenticateWithPasskey () {
  authError.value = false

  try {
    // Get authentication options from server
    const options = await apiRequest('auth/passkey')

    // Show spinner during authentication
    isAuthenticating.value = true

    // startAuthentication handles WebAuthn API calls and base64url conversions
    const credential = await startAuthentication(options)

    // Complete authentication
    const result = await apiRequest('auth/passkey', {
      ...credential,
      expectedChallenge: options.challenge
    }, {}, 'POST')

    // Store authentication data
    if (result.accounts?.length > 0) {
      accounts.value = result.accounts
    }

    if (result.token) {
      token.value = result.token
    }

    // Navigate to first account
    if (result.accounts?.length > 0) {
      await navigateTo({ path: `/${result.accounts.at(0)._id}` })
    }
  }
  catch (error) {
    console.error('Passkey authentication failed:', error)

    authError.value = true
  }
  finally {
    isAuthenticating.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-white p-4">
    <div class="w-full max-w-fit space-y-6">
      <n-spin
        v-if="isAuthenticating"
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

        <template v-else>
          <n-card>
            <div class="space-y-3">
              <p class="max-w-sm text-sm text-gray-700">
                {{ t('description') }}
              </p>

              <div
                v-if="authError"
                class="space-y-2"
              >
                <p class="max-w-sm text-sm font-medium text-gray-700">
                  {{ t('errorTitle') }}
                </p>
                <ol class="max-w-sm list-inside list-decimal space-y-1 text-sm text-gray-600">
                  <li>{{ t('step1') }}</li>
                  <li>{{ t('step2') }}</li>
                  <li>{{ t('step3') }}</li>
                </ol>
              </div>
            </div>
          </n-card>

          <n-button
            type="primary"
            size="large"
            block
            @click="authenticateWithPasskey"
          >
            {{ t('authenticateButton') }}
          </n-button>
        </template>
      </template>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Sign in with Passkey
    notSupported: Passkeys are not supported on this device
    authenticateButton: Sign in with Passkey
    description: Passkeys let you sign in to Entu securely using your fingerprint, face recognition, or device PIN. No passwords needed - just use your device's built-in security.
    errorTitle: 'If you have not set up Passkey, then:'
    step1: Sign in using another authentication method
    step2: Open your person object (at the bottom of the left menu)
    step3: Edit the person object and add a Passkey
  et:
    title: Logi sisse turvavõtmega
    notSupported: Turvavõti ei ole sellel seadmel toetatud
    authenticateButton: Logi sisse turvavõtmega
    description: Turvavõti võimaldab sul Entusse turvaliselt sisse logida sõrmejälje, näotuvastuse või seadme PIN-koodiga. Paroolid pole vajalikud - kasuta lihtsalt oma seadme sisseehitatud turvalisust.
    errorTitle: 'Kui sa ei ole turvavõtit seadistanud, siis:'
    step1: Logi sisse kasutades muud autentimismeetodit
    step2: Ava oma persooni objekt (all vasakpoolses menüüs)
    step3: Muuda persooni objekti ja lisa uus turvavõti
</i18n>
