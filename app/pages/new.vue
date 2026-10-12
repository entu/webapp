<script setup>
import { NAlert, NInput, NStep, NSteps } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { token, tokenExpiry } = useUser()

// A new user usually has no passkey yet, so signup goes to the passkey page that creates one first
const buttonGroups = computed(() => authProviderGroups('create').map((group) => group.map((provider) => ({
  id: provider.id,
  icon: provider.icon,
  label: t(provider.label),
  onClick: () => signInWith(provider)
}))))

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
  if (isChecking.value) {
    return t('checking')
  }
  // A free name needs no message - the next step opening says it
  if (!availability.value || availability.value === 'available') return

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
  navigateTo(`/auth/${provider.path}`)
}

// Keeps the typed name across the language switch's reload
function keepName () {
  if (databaseName.value) {
    sessionStorage.setItem('new-database', databaseName.value)
  }
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
  <my-auth-layout
    :description="t('description')"
    :title="t('title')"
    @language="keepName()"
  >
    <n-steps
      vertical
      :current="isAvailable ? 2 : 1"
      :status="error ? 'error' : 'process'"
    >
      <n-step :title="t('stepName')">
        <div class="flex flex-col gap-2 pt-2">
          <p class="text-sm text-gray-500">
            {{ t('databasePermanent') }}
          </p>

          <n-input
            v-model:value="databaseName"
            autofocus
            round
            size="large"
            :placeholder="t('databaseName')"
            :status="inputStatus"
            @input="validateName()"
          />

          <p
            v-if="statusMessage"
            class="text-sm"
            :class="{ 'text-red-600': inputStatus === 'error', 'text-gray-500': isChecking }"
          >
            {{ statusMessage }}
          </p>

          <my-markdown
            v-if="!isAvailable"
            class="text-sm text-gray-500"
            :source="t('databaseInfo')"
          />
        </div>
      </n-step>

      <n-step :title="isSignedIn ? t('create') : t('stepSignIn')">
        <!-- Only a valid, free name opens this step; an error still shows here -->
        <div
          v-if="error || isAvailable"
          class="flex flex-col gap-3 pt-2"
        >
          <n-alert
            v-if="error"
            type="error"
            :title="t('error')"
          >
            {{ error }}
          </n-alert>

          <template v-if="isAvailable">
            <my-button
              v-if="isSignedIn"
              block
              size="large"
              strong
              type="success"
              :label="t('create')"
              :loading="isCreating"
              @click="createDatabase()"
            />

            <template v-else>
              <p class="text-sm text-gray-500">
                {{ t('signInInfo') }}
              </p>

              <my-auth-buttons :groups="buttonGroups" />
            </template>
          </template>
        </div>
      </n-step>
    </n-steps>
  </my-auth-layout>
</template>

<i18n lang="yaml">
  en:
    title: Create a new Entu database
    description: Choose a permanent name for your database. It will be ready to use right away.
    databaseName: Database name
    databaseInfo: Name can contain only letters, numbers and underscores, must start with a letter and be 4–12 characters long.
    databasePermanent: Name cannot be changed later.
    checking: Checking availability…
    error-format: This name contains invalid characters
    error-length: The name must be 4–12 characters long
    error-reserved: This name is reserved
    error-taken: This name is already taken
    create: Create Database
    stepName: Choose a name
    stepSignIn: Sign in
    signInInfo: Your database is created right after you sign in.
    error: Error
  et:
    title: Loo uus Entu andmebaas
    description: Vali oma andmebaasile püsiv nimi. See on kohe kasutamiseks valmis.
    databaseName: Andmebaasi nimi
    databaseInfo: Nimi võib sisaldada ainult tähti, numbreid ja allkriipse, peab algama tähega ning olema 4–12 tähemärki pikk.
    databasePermanent: Nime ei saa hiljem muuta.
    checking: Kontrollime saadavust…
    error-format: Nimi sisaldab keelatud tähemärke
    error-length: Nimi peab olema 4–12 tähemärki pikk
    error-reserved: See nimi on reserveeritud
    error-taken: See nimi on juba kasutusel
    create: Loo andmebaas
    stepName: Vali nimi
    stepSignIn: Logi sisse
    signInInfo: Sinu andmebaas luuakse kohe pärast sisselogimist.
    error: Viga
</i18n>
