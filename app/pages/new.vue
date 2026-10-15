<script setup>
import { NAlert, NInput, NStep, NSteps, useThemeVars } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const themeVars = useThemeVars()
const { isMobile } = useIsMobile()
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
    wide
    :description="t('description')"
    :title="t('title')"
    @language="keepName()"
  >
    <!-- Each step's content sits under its title - in a column on desktop, stacked on a phone -->
    <n-steps
      :current="isAvailable ? 2 : 1"
      :status="error || inputStatus === 'error' ? 'error' : 'process'"
      :vertical="isMobile"
    >
      <n-step :title="t('stepName')">
        <div class="flex flex-col gap-2 md:pr-12">
          <p class="mb-4 text-sm text-slate-600 dark:text-slate-300">
            {{ t('databasePermanent') }}
          </p>

          <n-input
            v-model:value="databaseName"
            autofocus
            class="mb-4"
            round
            size="large"
            :input-props="{ 'aria-label': t('databaseName'), 'aria-describedby': statusMessage ? 'database-name-status' : undefined, 'aria-invalid': inputStatus === 'error' }"
            :placeholder="t('databaseName')"
            :status="inputStatus"
            @input="validateName()"
          />

          <p
            v-if="statusMessage"
            id="database-name-status"
            aria-live="polite"
            class="text-sm"
            :class="{ 'text-red-600 dark:text-red-400': inputStatus === 'error', 'text-slate-600 dark:text-slate-300': isChecking }"
          >
            {{ statusMessage }}
          </p>

          <my-markdown
            v-if="!isAvailable"
            class="text-sm text-slate-600 dark:text-slate-300"
            :source="t('databaseInfo')"
          />
        </div>
      </n-step>

      <!-- Always shown; the buttons work only once the name is valid and free -->
      <n-step :title="isSignedIn ? t('create') : t('stepSignIn')">
        <div class="flex flex-col gap-3 md:pr-12">
          <n-alert
            v-if="error"
            type="error"
            :title="t('error')"
          >
            {{ error }}
          </n-alert>

          <template v-if="isSignedIn">
            <p class="mb-3 text-sm text-slate-600 dark:text-slate-300">
              {{ t('createInfo') }}
            </p>

            <my-button
              block
              size="large"
              strong
              type="success"
              :disabled="!isAvailable"
              :label="t('create')"
              :loading="isCreating"
              @click="createDatabase()"
            />
          </template>

          <template v-else>
            <p class="mb-3 text-sm text-slate-600 dark:text-slate-300">
              {{ t('signInInfo') }}
            </p>

            <my-auth-buttons
              :disabled="!isAvailable"
              :groups="buttonGroups"
            />
          </template>
        </div>
      </n-step>

      <!-- What happens after signing in - this step never becomes active here, the new database opens instead -->
      <n-step :title="t('stepStart')">
        <p class="text-sm text-slate-600 md:pr-12 dark:text-slate-300">
          {{ isSignedIn ? t('startInfoSignedIn') : t('startInfo') }}
        </p>
      </n-step>
    </n-steps>
  </my-auth-layout>
</template>

<style scoped>
.n-steps :deep(.n-step-content-header__title) {
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Naive greys out waiting and finished step titles; every step keeps the active title's color, an error stays red */
.n-steps :deep(.n-step:not(.n-step--error-status) .n-step-content-header__title) {
  color: v-bind('themeVars.textColor1');
}
</style>

<i18n lang="yaml">
  en:
    title: Create a new Entu database
    description: Set up your own database in three short steps. No payment details are needed to get started.
    databaseName: Database name
    databaseInfo: Name can contain only letters, numbers and underscores, must start with a letter and be 4–12 characters long.
    databasePermanent: Pick a short name for your database. It becomes part of the database's web address and cannot be changed later.
    checking: Checking availability…
    error-format: This name contains invalid characters
    error-length: The name must be 4–12 characters long
    error-reserved: This name is reserved
    error-taken: This name is already taken
    create: Create Database
    stepName: Database name
    stepSignIn: Sign in
    stepStart: Start using
    createInfo: You are already signed in, so the database is created with your current sign-in and you become its owner.
    signInInfo: Choose how you want to sign in. You can add more sign-in methods later in your own person entity.
    startInfo: Your new database opens ready to use right after you sign in, so you can add your first entries at once.
    startInfoSignedIn: Your new database opens ready to use as soon as it is created, so you can add your first entries at once.
    error: Error
  et:
    title: Loo uus Entu andmebaas
    description: Loo oma andmebaas kolme lühikese sammuga. Alustamiseks pole makseandmeid vaja.
    databaseName: Andmebaasi nimi
    databaseInfo: Nimi võib sisaldada ainult tähti, numbreid ja allkriipse, peab algama tähega ning olema 4–12 tähemärki pikk.
    databasePermanent: Vali andmebaasile lühike nimi. Sellest saab osa andmebaasi veebiaadressist ja seda ei saa hiljem muuta.
    checking: Kontrollime saadavust…
    error-format: Nimi sisaldab keelatud tähemärke
    error-length: Nimi peab olema 4–12 tähemärki pikk
    error-reserved: See nimi on reserveeritud
    error-taken: See nimi on juba kasutusel
    create: Loo andmebaas
    stepName: Andmebaasi nimi
    stepSignIn: Logi sisse
    stepStart: Alusta
    createInfo: Oled juba sisse logitud, seega luuakse andmebaas sinu praeguse sisselogimisega ja sinust saab selle omanik.
    signInInfo: Vali, kuidas soovid sisse logida. Teisi sisselogimisviise saad hiljem lisada oma isikuobjektil.
    startInfo: Sinu uus andmebaas avaneb kohe pärast sisselogimist kasutusvalmis kujul ja saad esimesed objektid lisada.
    startInfoSignedIn: Sinu uus andmebaas avaneb kohe pärast loomist kasutusvalmis kujul ja saad esimesed objektid lisada.
    error: Viga
</i18n>
