<script setup>
import { NModal, NCard, NButton, NSpace } from 'naive-ui'

const route = useRoute()
const { t } = useI18n()
const { token, user } = useUser()
const { accounts } = useAccount()
const { authenticate, register, isSupported, isAvailable } = usePasskey()

definePageMeta({ layout: 'blank' })

const mode = ref('auth') // 'auth' or 'register'
const showPasskeyPrompt = ref(false)
const isRegisteringPasskey = ref(false)

async function hasExistingPasskeys (userEmail) {
  // This would need to be implemented as an API endpoint
  // For now, we'll assume no existing passkeys
  return false
}

async function registerPasskey () {
  isRegisteringPasskey.value = true

  try {
    await register()
    showPasskeyPrompt.value = false
    // Continue with navigation after successful registration
    proceedWithNavigation()
  }
  catch (error) {
    console.error('Passkey registration failed:', error)
    // Continue with navigation even if passkey registration fails
    showPasskeyPrompt.value = false
    proceedWithNavigation()
  }
  finally {
    isRegisteringPasskey.value = false
  }
}

function skipPasskey () {
  showPasskeyPrompt.value = false
  // Continue with navigation when user skips
  proceedWithNavigation()
}

function proceedWithNavigation () {
  const nextPage = useLocalStorage('next', { path: '/' })
  const authAccount = nextPage.value?.path.split('/').filter((x) => x !== 'new').at(1)
  const newUser = accounts.value.find((x) => x._id === authAccount)?.user || {}

  if (newUser.new) {
    navigateTo({ path: `/${authAccount}/${newUser?._id}`, hash: 'edit' })
  }
  else if (nextPage.value.path !== '/') {
    const to = { path: nextPage.value?.path || '/', query: nextPage.value?.query }
    nextPage.value = {}
    navigateTo(to)
  }
  else if (accounts.value.length > 0) {
    navigateTo({ path: `/${accounts.value.at(0)._id}` })
  }
  else {
    navigateTo({ path: '/new' })
  }
}

onMounted(async () => {
  useHead({ title: t('title') })

  if (!isSupported.value) {
    // Passkeys not supported, redirect to regular auth
    await navigateTo('/')
    return
  }

  // Check if this is a registration callback (user just authenticated with OAuth)
  if (route.query.register === 'true' && token.value && user.value && isAvailable.value) {
    mode.value = 'register'
    const hasPasskeys = await hasExistingPasskeys(user.value.email)

    if (!hasPasskeys) {
      showPasskeyPrompt.value = true
      return // Don't proceed with authentication, show registration prompt
    }
  }

  // Normal passkey authentication flow
  try {
    const result = await authenticate()
    // Redirect to callback with temporary key
    await navigateTo(`/auth/callback?key=${result.key}`)
  }
  catch (error) {
    console.error('Passkey authentication failed:', error)
    // Redirect to regular auth on failure
    await navigateTo('/')
  }
})
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <div
      v-if="!showPasskeyPrompt"
      class="text-center"
    >
      <h1 class="mb-4 text-2xl font-bold">
        {{ mode === 'register' ? t('settingUp') : t('authenticating') }}
      </h1>
      <p class="text-gray-600">
        {{ mode === 'register' ? t('registerPrompt') : t('passkeyPrompt') }}
      </p>
    </div>

    <n-modal
      v-model:show="showPasskeyPrompt"
      :mask-closable="false"
    >
      <n-card
        style="width: 400px"
        :title="t('setupPasskey')"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <div class="mb-4">
          <p class="mb-2">
            {{ t('passkeyBenefits') }}
          </p>
          <ul class="list-inside list-disc space-y-1 text-sm text-gray-600">
            <li>{{ t('benefit1') }}</li>
            <li>{{ t('benefit2') }}</li>
            <li>{{ t('benefit3') }}</li>
          </ul>
        </div>

        <template #footer>
          <n-space justify="end">
            <n-button @click="skipPasskey">
              {{ t('skip') }}
            </n-button>
            <n-button
              type="primary"
              :loading="isRegisteringPasskey"
              @click="registerPasskey"
            >
              {{ t('setupNow') }}
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Sign In with Passkey
    authenticating: Authenticating...
    settingUp: Setting up...
    passkeyPrompt: Please use your passkey to sign in
    registerPrompt: Preparing passkey registration
    setupPasskey: Set up Passkey
    passkeyBenefits: Make your next sign-in faster and more secure with a passkey.
    benefit1: Sign in with just your fingerprint or face
    benefit2: No passwords to remember or type
    benefit3: More secure than traditional passwords
    setupNow: Set up now
    skip: Skip for now
  et:
    title: Sisene võtmega
    authenticating: Autentimine...
    settingUp: Seadistamine...
    passkeyPrompt: Palun kasutage sisselogimiseks oma võtit
    registerPrompt: Võtme registreerimise ettevalmistamine
    setupPasskey: Seadista võti
    passkeyBenefits: Tee oma järgmine sisselogimine kiiremaks ja turvalisemaks võtmega.
    benefit1: Logi sisse ainult sõrmejälje või näoga
    benefit2: Pole paroole, mida meelde jätta või tippida
    benefit3: Turvalisem kui tavalised paroolid
    setupNow: Seadista kohe
    skip: Jäta vahele
</i18n>
