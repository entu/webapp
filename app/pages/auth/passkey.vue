<script setup>
import { NCard, NButton, NSpace, NDivider } from 'naive-ui'

const { t } = useI18n()
const { user } = useUser()
const { authenticate, register, isSupported, isAvailable } = usePasskey()

definePageMeta({ layout: 'blank' })

const isAuthenticating = ref(false)
const isRegistering = ref(false)
const authResult = ref(null)
const registerResult = ref(null)
const authError = ref(null)
const registerError = ref(null)

async function authenticateWithPasskey() {
  isAuthenticating.value = true
  authError.value = null
  authResult.value = null

  try {
    const result = await authenticate()
    authResult.value = result
  } catch (error) {
    console.error('Passkey authentication failed:', error)
    authError.value = error.message || 'Authentication failed'
  } finally {
    isAuthenticating.value = false
  }
}

async function registerPasskey() {
  isRegistering.value = true
  registerError.value = null
  registerResult.value = null

  try {
    const result = await register()
    registerResult.value = result
  } catch (error) {
    console.error('Passkey registration failed:', error)
    registerError.value = error.message || 'Registration failed'
  } finally {
    isRegistering.value = false
  }
}

onMounted(() => {
  useHead({ title: t('title') })
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ t('title') }}
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          {{ t('description') }}
        </p>
      </div>

      <!-- Passkey Support Status -->
      <n-card v-if="!isSupported" class="border-red-200 bg-red-50">
        <div class="text-center">
          <p class="text-red-800">{{ t('notSupported') }}</p>
        </div>
      </n-card>

      <n-card v-else-if="!isAvailable" class="border-yellow-200 bg-yellow-50">
        <div class="text-center">
          <p class="text-yellow-800">{{ t('notAvailable') }}</p>
        </div>
      </n-card>

      <!-- Authentication Section -->
      <n-card v-if="isSupported && isAvailable">
        <template #header>
          <h2 class="text-lg font-semibold">{{ t('authenticate') }}</h2>
        </template>
        
        <div class="space-y-4">
          <p class="text-sm text-gray-600">{{ t('authDescription') }}</p>
          
          <n-button
            type="primary"
            size="large"
            block
            :loading="isAuthenticating"
            @click="authenticateWithPasskey"
          >
            {{ t('authenticateButton') }}
          </n-button>

          <!-- Authentication Result -->
          <div v-if="authResult" class="rounded bg-green-50 p-3">
            <p class="text-sm font-medium text-green-800">{{ t('authSuccess') }}</p>
            <pre class="mt-2 text-xs text-green-700">{{ JSON.stringify(authResult, null, 2) }}</pre>
          </div>

          <div v-if="authError" class="rounded bg-red-50 p-3">
            <p class="text-sm font-medium text-red-800">{{ t('authError') }}</p>
            <p class="mt-1 text-xs text-red-700">{{ authError }}</p>
          </div>
        </div>
      </n-card>

      <n-divider v-if="isSupported && isAvailable">{{ t('or') }}</n-divider>

      <!-- Registration Section -->
      <n-card v-if="isSupported && isAvailable">
        <template #header>
          <h2 class="text-lg font-semibold">{{ t('register') }}</h2>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-gray-600">{{ t('registerDescription') }}</p>
          
          <div class="text-sm text-gray-600">
            <p class="font-medium">{{ t('benefits') }}</p>
            <ul class="mt-1 list-inside list-disc space-y-1">
              <li>{{ t('benefit1') }}</li>
              <li>{{ t('benefit2') }}</li>
              <li>{{ t('benefit3') }}</li>
            </ul>
          </div>

          <n-button
            type="default"
            size="large"
            block
            :loading="isRegistering"
            @click="registerPasskey"
          >
            {{ t('registerButton') }}
          </n-button>

          <!-- Registration Result -->
          <div v-if="registerResult" class="rounded bg-green-50 p-3">
            <p class="text-sm font-medium text-green-800">{{ t('registerSuccess') }}</p>
            <pre class="mt-2 text-xs text-green-700">{{ JSON.stringify(registerResult, null, 2) }}</pre>
          </div>

          <div v-if="registerError" class="rounded bg-red-50 p-3">
            <p class="text-sm font-medium text-red-800">{{ t('registerError') }}</p>
            <p class="mt-1 text-xs text-red-700">{{ registerError }}</p>
          </div>
        </div>
      </n-card>

      <!-- Debug Info -->
      <n-card class="bg-gray-50">
        <template #header>
          <h3 class="text-sm font-medium text-gray-500">{{ t('debugInfo') }}</h3>
        </template>
        
        <div class="space-y-2 text-xs text-gray-600">
          <div><strong>{{ t('supported') }}:</strong> {{ isSupported ? t('yes') : t('no') }}</div>
          <div><strong>{{ t('available') }}:</strong> {{ isAvailable ? t('yes') : t('no') }}</div>
          <div v-if="user"><strong>{{ t('currentUser') }}:</strong> {{ user.email || user.name || 'Unknown' }}</div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Passkey Authentication
    description: Test and manage passkey authentication
    notSupported: Passkeys are not supported in this browser
    notAvailable: Passkeys are not available (user not authenticated or feature disabled)
    authenticate: Authenticate with Passkey
    authDescription: Use your existing passkey to authenticate
    authenticateButton: Authenticate with Passkey
    authSuccess: Authentication successful!
    authError: Authentication failed
    register: Register New Passkey
    registerDescription: Create a new passkey for faster and more secure authentication
    benefits: Benefits of using passkeys:
    benefit1: Sign in with just your fingerprint, face, or device PIN
    benefit2: No passwords to remember or type
    benefit3: More secure than traditional passwords
    registerButton: Register New Passkey
    registerSuccess: Passkey registered successfully!
    registerError: Passkey registration failed
    debugInfo: Debug Information
    supported: Supported
    available: Available
    currentUser: Current User
    yes: "Yes"
    no: "No"
    or: OR
  et:
    title: Võtme autentimine
    description: Testi ja halda võtme autentimist
    notSupported: Võtmed ei ole selles brauseris toetatud
    notAvailable: Võtmed ei ole saadaval (kasutaja pole autentitud või funktsioon on keelatud)
    authenticate: Autenti võtmega
    authDescription: Kasuta olemasolevat võtit autentimiseks
    authenticateButton: Autenti võtmega
    authSuccess: Autentimine õnnestus!
    authError: Autentimine ebaõnnestus
    register: Registreeri uus võti
    registerDescription: Loo uus võti kiiremaks ja turvalisemaks autentimiseks
    benefits: Võtmete kasutamise eelised:
    benefit1: Logi sisse ainult sõrmejälje, näo või seadme PIN-koodiga
    benefit2: Pole paroole, mida meelde jätta või tippida
    benefit3: Turvalisem kui tavalised paroolid
    registerButton: Registreeri uus võti
    registerSuccess: Võti registreeriti edukalt!
    registerError: Võtme registreerimine ebaõnnestus
    debugInfo: Silumise informatsioon
    supported: Toetatud
    available: Saadaval
    currentUser: Praegune kasutaja
    yes: "Jah"
    no: "Ei"
    or: VÕI
</i18n>
