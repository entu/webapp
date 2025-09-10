<script setup>
import { NAlert, NButton, NCard, NInput, NPopover, NSpin, NSwitch } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const { path, query } = useRoute()
const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const { token, user, logOut } = useUser()

const databaseName = ref('')
const plan = ref(query.plan || '3')
const checkoutId = ref(query.checkout)
const userName = ref('')
const userEmail = ref('')
const isCreating = ref(false)
const error = ref()

const authProviders = ref(
  [
    { value: 'apple', icon: 'apple', to: { path: '/auth/apple' } },
    { value: 'google', icon: 'google', to: { path: '/auth/google' } },
    { value: 'sid', icon: 'smart-id', to: { path: '/auth/smart-id' } },
    { value: 'mid', icon: 'mobile-id', to: { path: '/auth/mobile-id' } },
    { value: 'idc', icon: 'id-card', to: { path: '/auth/id-card' } }
  ]
)
const types = ref([
  { value: 'person', selected: true, disabled: true },
  { value: 'department', selected: false },
  { value: 'folder', selected: false },
  { value: 'document', selected: false },
  { value: 'book', selected: false },
  { value: 'audiovideo', selected: false }
])
const plans = computed(() => runtimeConfig.public.stripePaths.split(',').map((p) => {
  const [value, stripe] = p.split(':')
  return { value, stripe }
}))

const isValidForm = computed(() => {
  error.value = undefined

  return databaseName.value && databaseName.value.length >= 4 && databaseName.value.length <= 12 && userName.value && userEmail.value && token.value
})

function validateName () {
  databaseName.value = databaseName.value?.replace(/[^a-z0-9_]/gi, '').toLowerCase()

  while (databaseName.value && (/^[_0-9]/.test(databaseName.value))) {
    databaseName.value = databaseName.value.substring(1)
  }
}

async function createDatabase () {
  isCreating.value = true
  error.value = undefined

  const { database, person, message } = await fetch(`${runtimeConfig.public.apiUrl}/entu`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.value}`
    },
    body: JSON.stringify({
      database: databaseName.value,
      types: types.value.filter((t) => t.selected).map((t) => t.value),
      name: userName.value,
      email: userEmail.value
    })
  }).then((response) => response.json())

  if (message) {
    error.value = message
    isCreating.value = false
    return
  }

  if (!database || !person) {
    isCreating.value = false
    return
  }

  const url = new URL('https://buy.stripe.com')

  url.pathname = plans.value.find((p) => p.value === plan.value).stripe
  url.searchParams.set('prefilled_email', userEmail.value)
  url.searchParams.set('client_reference_id', `${database}-${person}`)
  url.searchParams.set('locale', locale.value)

  await navigateTo(url.toString(), { external: true })
}

function setLanguage () {
  setLocale(locale.value === 'en' ? 'et' : 'en')
  reloadNuxtApp()
}

onMounted(() => {
  useHead({ title: t('title') })

  if (query.locale) {
    setLocale(query.locale === 'en' ? 'en' : 'et')
  }

  if (checkoutId.value) {
    logOut()

    return
  }

  router.replace({ path, query: {} })

  userName.value = user.value?.name || ''
  userEmail.value = user.value?.email || ''
})
</script>

<template>
  <div class="size-full overflow-auto bg-gray-50">
    <div class="my-8 flex w-full flex-col gap-8 px-4 sm:mx-auto sm:w-96">
      <div class="-mb-6">
        <span
          class="float-right cursor-pointer text-xs font-bold uppercase text-gray-500"
          @click="setLanguage()"
        >
          {{ t('language') }}
        </span>
      </div>

      <a href="/">
        <img
          class="mx-auto size-24"
          src="/logo.png"
        >
      </a>

      <template v-if="checkoutId">
        <n-card :title="t('success')">
          <template #footer>
            <my-markdown
              class="mt-1 text-sm"
              :source="t('successInfo')"
            />
          </template>
        </n-card>

        <n-button
          secondary
          size="large"
          strong
          @click="navigateTo({ path: '/' })"
        >
          {{ t('continue') }}
        </n-button>
      </template>

      <template v-else-if="isCreating">
        <n-card :title="t('creating')">
          <template #footer>
            <div class="flex justify-center">
              <n-spin size="small" />
            </div>
            <my-markdown
              class="mt-6 text-sm"
              :source="t('creatingInfo')"
            />
          </template>
        </n-card>
      </template>

      <template v-else>
        <n-card
          v-if="!token"
          :title="t('auth')"
        >
          <nuxt-link
            v-for="provider in authProviders"
            :key="provider.value"
            :to="provider.to"
            class="flex items-center gap-2 border-b py-2 last-of-type:border-b-0"
          >
            <my-icon :icon="provider.icon" />
            {{ t(`auth-${provider.value}`) }}
          </nuxt-link>
          <template #footer>
            <my-markdown
              class="mt-1 text-sm"
              :source="t('authInfo')"
            />
          </template>
        </n-card>

        <n-card
          :class="{ 'select-none opacity-50': !token }"
          :title="t('title')"
        >
          <n-input
            v-model:value="databaseName"
            autofocus
            :disabled="!token"
            :placeholder="t('databaseName')"
            @keyup="validateName()"
          />

          <template #footer>
            <my-markdown
              class="mt-1 text-sm"
              :source="t('databaseInfo')"
            />
          </template>
        </n-card>

        <n-card
          :class="{ 'select-none opacity-30': !token }"
          :title="t('user')"
        >
          <n-input
            v-model:value="userName"
            :disabled="!token"
            :placeholder="t('userName')"
          />

          <n-input
            v-model:value="userEmail"
            class="mt-2"
            type="email"
            :disabled="!token"
            :placeholder="t('userEmail')"
          />

          <template #footer>
            <my-markdown
              class="mt-1 text-sm"
              :source="t('userInfo')"
            />
          </template>
        </n-card>

        <n-card
          :class="{ 'select-none opacity-20': !token }"
          :title="t('types')"
        >
          <div
            v-for="tp in types"
            :key="tp.value"
            class="flex items-center justify-between border-b py-2 last-of-type:border-b-0"
          >
            {{ t(`typeLabel-${tp.value}`) }}

            <n-switch
              v-model:value="tp.selected"
              :disabled="tp.disabled || !token"
            />
          </div>

          <template #footer>
            <my-markdown
              class="mt-1 text-sm"
              :source="t('typesInfo')"
            />
          </template>
        </n-card>

        <n-card
          :class="{ 'select-none opacity-5': !token }"
          :title="t('price')"
        >
          <n-popover
            v-for="p in plans"
            :key="p.value"
            class="max-w-72"
            trigger="manual"
            placement="left"
            :show="token && plan === p.value"
          >
            <template #trigger>
              <div
                class="price"
                :class="{ active: plan === p.value }"
                @click="plan = p.value"
              >
                {{ t(`price${p.value}label`) }}
                <span class="float-end">
                  {{ t(`price${p.value}price`) }}
                </span>
              </div>
            </template>

            <my-markdown
              class="text-sm"
              :source="t(`price${p.value}info`)"
            />
          </n-popover>

          <template #footer>
            <my-markdown
              class="mt-2 text-sm"
              :source="t('priceInfo')"
            />
          </template>
        </n-card>

        <n-card
          :class="{ 'select-none opacity-0': !token }"
          :title="t('billing')"
        >
          <template #footer>
            <my-markdown
              class="mt-2 text-sm"
              :source="t('billingInfo')"
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

        <n-button
          v-if="token"
          secondary
          size="large"
          strong
          type="success"
          :disabled="!isValidForm"
          :loading="isCreating"
          @click="createDatabase()"
        >
          {{ t('create') }}
        </n-button>
      </template>
    </div>
    <div class="mb-2 px-4 text-center text-sm text-gray-500">
      <a
        target="_blank"
        :href="t('termsUrl')"
      >{{ t('terms') }}</a>
    </div>
  </div>
</template>

<style scoped>
.price {
  @apply py-2;
  @apply flex justify-between items-center;
  @apply border-t border-t-gray-200;
  @apply border-b border-b-white;
  @apply cursor-pointer;
}
.price:first-child {
  @apply border-t border-t-white;
}

.price.active + .price {
  @apply border-t-white;
}

.price.active {
  @apply -mx-2 px-2;
  @apply bg-sky-100;
  @apply border border-gray-200;
  @apply rounded-sm;
  @apply font-bold;
}
</style>

<i18n lang="yaml">
  en:
    language: Eesti keel
    title: Create a new database
    databaseName: Database Name
    databaseInfo: |
      Name can contain only letters and underscores, it must start with a letter and must be 4 to 12 characters long.

      Database name cannot be changed later.

    user: User
    userName: Name
    userEmail: Email
    userInfo: |
      User name and email are required to create the first user account.

      You can add more users later.
    auth: Sign In
    authInfo: |
      **You need to sign in to create a database!**

      We only use those authentication providers. We do not store your password.
    auth-apple: Apple
    auth-google: Google
    auth-sid: Smart-ID
    auth-mid: Mobile-ID
    auth-idc: ID-Card

    types: Data Types
    typesInfo: |
      Data types are used to define data. Select the desired pre-set types.

      You can also create new data types later.
    typeLabel-person: Person
    typeLabel-department: Department
    typeLabel-folder: Folder
    typeLabel-document: Document
    typeLabel-book: Book
    typeLabel-audiovideo: Audio-Video

    price: Package
    priceInfo: |
      Price per month including VAT.

      **First 14 days are free** (no credit card required).
    price1price: 2 €
    price1label: 1,000 objects
    price1info: |
      - Up to 1,000 objects
      - Up to 1GB storage
      - Unlimited users
    price2price: 10 €
    price2label: 10,000 objects
    price2info: |
      - Up to 10,000 objects
      - Up to 10GB storage
      - Unlimited users
      - Daily backup
    price3price: 40 €
    price3label: 100,000 objects
    price3info: |
      - Up to 100,000 objects
      - Up to 100GB storage
      - Unlimited users
      - Daily backup
      - ID-card and Mobile-ID authentication
      - Own domain
    price4price: 200 €
    price4label: 500,000 objects
    price4info: |
      - Up to 500,000 objects
      - Up to 500GB storage
      - Unlimited users
      - Daily backup
      - ID-card and Mobile-ID authentication
      - Own domain
      - Priority support
    billing: Billing and subscription
    billingInfo: |
      We use [Stripe](https://stripe.com) to process payments. We do not store your payment information.

      On clicking the "Create Database" button, you will be redirected to the Stripe. Please enter your information there and confirm the subscription.

      After that, you will be redirected back to your new database in Entu.

    create: Create Database
    creating: Creating database
    creatingInfo: |
      Please wait while we create your database. This may take a few seconds.

      Once the database is created, you will be redirected to the payment page.
    success: Your database is created!
    successInfo: |
      You need to sign in with same authentication provider as you used to create the database.

      Enjoy!
    continue: Continue
    error: Error
    terms: Terms of Service
    termsUrl: https://www.entu.app/terms
  et:
    language: English
    title: Loo uus andmebaas
    databaseName: Andmebaasi nimi
    databaseInfo: |
      Nimi võib sisaldada ainult tähti ja allkriipse, see peab algama tähega ja olema 4 kuni 12 tähemärki pikk.

      Andmebaasi nime hiljem muuta ei saa.
    auth: Sisene
    authInfo: |
      **Andmebaasi loomiseks peate sisse logima!**

      Me kasutame ainult neid autentimisviise. Me ei salvesta teie parooli.
    auth-apple: Apple
    auth-google: Google
    auth-sid: Smart-ID
    auth-mid: Mobiil-ID
    auth-idc: ID-kaart

    user: Kasutaja
    userName: Nimi
    userEmail: E-post
    userInfo: |
      Kasutaja nime ja e-posti aadress on vajalikud esimese kasutaja loomiseks.

      Hiljem saate lisada veel kasutajaid.
    types: Andmetüübid
    typesInfo: |
      Andmetüüpe kasutatakse andmete määratlemiseks. Valige soovitud eelseadistatud tüübid.

      Uusi andmetüüpe saate luua ka hiljem.
    typeLabel-person: Persoon
    typeLabel-department: Osakond
    typeLabel-folder: Kaust
    typeLabel-document: Dokument
    typeLabel-book: Raamat
    typeLabel-audiovideo: Auvis

    price: Pakett
    priceInfo: |
      Hind kuus koos käibemaksuga.

      **Esimesed 14 päeva on tasuta** (krediitkaarti pole vaja).
    price1price: 2 €
    price1label: 1000 objekti
    price1info: |
      - Kuni 1000 objekti
      - Kuni 1GB andmeid
      - Piiramatult kasutajaid
    price2price: 10 €
    price2label: 10 000 objekti
    price2info: |
      - Kuni 10 000 objekti
      - Kuni 10GB andmeid
      - Piiramatult kasutajaid
      - Igapäevane varukoopia
    price3price: 40 €
    price3label: 100 000 objekti
    price3info: |
      - Kuni 100 000 objekti
      - Kuni 100GB andmeid
      - Piiramatult kasutajaid
      - Igapäevane varukoopia
      - ID-kaardi ja Mobiil-ID tugi
      - Oma aadress
    price4price: 200 €
    price4label: 500 000 objekti
    price4info: |
      - Kuni 500 000 objekti
      - Kuni 500GB andmeid
      - Piiramatult kasutajaid
      - Igapäevane varukoopia
      - ID-kaardi ja Mobiil-ID tugi
      - Oma aadress
      - Personaalteenindus
    billing: Arveldamine ja tellimus
    billingInfo: |
      Me kasutame maksete töötlemiseks [Stripe](https://stripe.com) teenust. Me ei salvesta teie makseandmeid.

      Vajutades nupule "Loo andmebaas", suunatakse teid Stripe'i. Palun sisestage oma andmed ja kinnitage tellimus.

      Pärast seda suunatakse teid tagasi oma uude andmebaasi Entus.
    create: Loo andmebaas
    creating: Andmebaasi loomine
    creatingInfo: |
      Palun oodake, kuni loome teie andmebaasi. See võib võtta mõne sekundi.

      Andmebaasi loomisel suunatakse teid makselehele.
    success: Andmebaas on loodud!
    successInfo: |
      Sisselogimiseks kasutage sama autentimisviisi, mida kasutasite andmebaasi loomisel.

      Head kasutamist!
    continue: Jätka
    error: Viga
    terms: Kasutustingimused
    termsUrl: https://www.entu.app/et/tingimused
</i18n>
