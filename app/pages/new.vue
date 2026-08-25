<script setup>
import { NAlert, NCard, NInput } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const { token, tokenExpiry } = useUser()

const authProviderGroups = [
  [
    { value: 'apple', icon: 'apple' },
    { value: 'google', icon: 'google' },
    { value: 'e-mail', icon: 'e-mail' }
  ],
  [
    { value: 'smart-id', icon: 'smart-id' },
    { value: 'mobile-id', icon: 'mobile-id' },
    { value: 'id-card', icon: 'id-card' }
  ]
]

const databaseName = ref('')
const availability = ref()
const isChecking = ref(false)
const isCreating = ref(false)
const error = ref()

let checkTimeout = null
let checkCounter = 0

const isSignedIn = computed(() => !!token.value && !!tokenExpiry.value && new Date(tokenExpiry.value).getTime() > Date.now())
const isValidFormat = computed(() => /^[a-z][a-z0-9_]{3,11}$/.test(databaseName.value))
const isAvailable = computed(() => isValidFormat.value && availability.value === 'available')

const inputStatus = computed(() => availability.value && availability.value !== 'available' ? 'error' : undefined)

const statusMessage = computed(() => {
  if (isChecking.value) return t('checking')
  if (!availability.value) return
  if (availability.value === 'available') return t('available')

  return t(`error-${availability.value}`)
})

watch(databaseName, () => {
  availability.value = undefined
  error.value = undefined
  isChecking.value = false
  checkCounter++

  clearTimeout(checkTimeout)

  if (!isValidFormat.value) return

  isChecking.value = true
  checkTimeout = setTimeout(checkAvailability, 400)
})

function validateName () {
  databaseName.value = databaseName.value?.replace(/[^a-z0-9_]/gi, '').toLowerCase()

  while (databaseName.value && (/^[_0-9]/.test(databaseName.value))) {
    databaseName.value = databaseName.value.slice(1)
  }
}

async function checkAvailability () {
  const requestId = ++checkCounter

  try {
    const { available, reason } = await $fetch(`${runtimeConfig.public.apiUrl}/new/${databaseName.value}`)

    if (requestId !== checkCounter) return

    availability.value = available ? 'available' : reason
  }
  catch (e) {
    if (requestId !== checkCounter) return

    error.value = e.data?.statusMessage || e.message
  }

  isChecking.value = false
}

async function createDatabase () {
  if (!isAvailable.value || isCreating.value) return

  isCreating.value = true
  error.value = undefined

  try {
    const db = await setupNewDatabase(token.value, databaseName.value)

    await navigateTo(`/${db}`)
  }
  catch (e) {
    error.value = e.data?.statusMessage || e.message
    isCreating.value = false

    checkAvailability()
  }
}

function signInWith (provider) {
  if (!isAvailable.value) return

  sessionStorage.setItem('new-database', databaseName.value)
  navigateTo(`/auth/${provider}`)
}

function setLanguage () {
  if (databaseName.value) {
    sessionStorage.setItem('new-database', databaseName.value)
  }

  setLocale(locale.value === 'en' ? 'et' : 'en')
  reloadNuxtApp()
}

onMounted(() => {
  useHead({ title: t('title') })

  const savedName = sessionStorage.getItem('new-database')

  if (savedName) {
    databaseName.value = savedName
    sessionStorage.removeItem('new-database')
  }

  const savedError = sessionStorage.getItem('new-database-error')

  if (savedError) {
    error.value = savedError
    sessionStorage.removeItem('new-database-error')
  }
})
</script>

<template>
  <div class="flex min-h-full flex-col">
    <div class="flex w-full flex-col items-center">
      <div class="flex w-full justify-end px-4 pt-4">
        <span
          class="cursor-pointer text-xs font-bold text-gray-500 uppercase"
          @click="setLanguage()"
        >
          {{ t('language') }}
        </span>
      </div>

      <div class="py-4">
        <a href="/">
          <img
            class="size-24"
            src="/logo.png"
          >
        </a>
      </div>
    </div>

    <div class="flex flex-col items-center gap-1 px-4 pb-6 text-center">
      <div class="text-xl font-semibold">
        {{ t('title') }}
      </div>
      <div class="text-sm text-gray-500">
        {{ t('description') }}
      </div>
    </div>

    <div class="mb-8 flex w-full flex-col gap-8 px-4 sm:mx-auto sm:w-96">
      <n-card>
        <n-input
          v-model:value="databaseName"
          autofocus
          :placeholder="t('databaseName')"
          :status="inputStatus"
          @input="validateName()"
        />

        <p
          v-if="statusMessage"
          class="mt-2 text-sm"
          :class="{ 'text-red-600': inputStatus === 'error', 'text-gray-500': isChecking, 'text-green-600': isAvailable }"
        >
          {{ statusMessage }}
        </p>

        <template #footer>
          <my-markdown
            class="mt-1 text-sm"
            :source="t('databaseInfo')"
          />
        </template>
      </n-card>

      <n-alert
        v-if="error"
        type="error"
        :title="t('error')"
      >
        {{ error }}
      </n-alert>

      <my-button
        v-if="isSignedIn"
        secondary
        size="large"
        strong
        type="success"
        :disabled="!isAvailable"
        :label="t('create')"
        :loading="isCreating"
        @click="createDatabase()"
      />

      <n-card
        v-else
        :title="t('signInTitle')"
      >
        <div class="flex flex-col gap-6">
          <div
            v-for="(group, index) in authProviderGroups"
            :key="index"
          >
            <div
              v-for="provider in group"
              :key="provider.value"
              class="flex items-center gap-2 border-b border-b-gray-200 py-2 last-of-type:border-b-0"
              :class="{
                'cursor-pointer': isAvailable,
                'pointer-events-none opacity-40': !isAvailable,
              }"
              @click="signInWith(provider.value)"
            >
              <my-icon :icon="provider.icon" />
              {{ t(`auth-${provider.value}`) }}
            </div>
          </div>
        </div>

        <template #footer>
          <p class="mt-1 text-sm text-gray-500">
            {{ t('signInInfo') }}
          </p>
        </template>
      </n-card>
    </div>

    <my-footer class="mt-auto mb-4" />
  </div>
</template>

<i18n lang="yaml">
  en:
    language: Eesti keel
    title: Create a new Entu database
    description: Choose a permanent name for your database. It will be ready to use right away.
    databaseName: Database name
    databaseInfo: Database name can contain only letters, numbers and underscores, must start with a letter, be 4–12 characters long, and cannot be changed later.
    checking: Checking availability…
    available: This name is available
    error-format: This name contains invalid characters
    error-length: The name must be 4–12 characters long
    error-reserved: This name is reserved
    error-taken: This name is already taken
    create: Create Database
    signInTitle: Sign in to create your database
    signInInfo: Choose a database name above, then sign in with one of these options. Your database is created right after you sign in.
    auth-e-mail: E-mail
    auth-google: Google
    auth-apple: Apple
    auth-smart-id: Smart-ID
    auth-mobile-id: Mobile-ID
    auth-id-card: ID-Card
    error: Error
  et:
    language: English
    title: Loo uus Entu andmebaas
    description: Vali oma andmebaasile püsiv nimi. See on kohe kasutamiseks valmis.
    databaseName: Andmebaasi nimi
    databaseInfo: Andmebaasi nimi võib sisaldada ainult tähti, numbreid ja allkriipse, peab algama tähega, olema 4–12 tähemärki pikk ning seda ei saa hiljem muuta.
    checking: Kontrollime saadavust…
    available: See nimi on vaba
    error-format: Nimi sisaldab keelatud tähemärke
    error-length: Nimi peab olema 4–12 tähemärki pikk
    error-reserved: See nimi on reserveeritud
    error-taken: See nimi on juba kasutusel
    create: Loo andmebaas
    signInTitle: Andmebaasi loomiseks logi sisse
    signInInfo: Vali üleval andmebaasi nimi ja logi seejärel sisse ühega neist valikutest. Sinu andmebaas luuakse kohe pärast sisselogimist.
    auth-e-mail: E-post
    auth-google: Google
    auth-apple: Apple
    auth-smart-id: Smart-ID
    auth-mobile-id: Mobiil-ID
    auth-id-card: ID-kaart
    error: Viga
</i18n>
