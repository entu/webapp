<script setup>
import { NButton, NCard, NInput, NPopover, NSwitch } from 'naive-ui'

definePageMeta({ layout: 'blank' })
const { query } = useRoute()
const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const { token, user } = useUser()

const databaseName = ref('')
const plan = ref(query.plan || '3')
const userName = ref('')
const userEmail = ref('')

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
  { value: 'book', selected: false }
])
const plans = ref(['1', '2', '3', '4'])

function validateName () {
  databaseName.value = databaseName.value?.trim().replace(/[^a-zA-Z_]/g, '').toLowerCase()

  while (databaseName.value && !/^[a-zA-Z]/.test(databaseName.value)) {
    databaseName.value = databaseName.value.substring(1)
  }
}

async function createDatabase () {
  if (token.value) {
    console.log('Creating database', databaseName.value)
  } else {
    await navigateTo({ path: '/auth' })
  }
}

function setLanguage () {
  setLocale(locale.value === 'en' ? 'et' : 'en')
  reloadNuxtApp()
}

onMounted(() => {
  useHead({ title: t('title') })

  userName.value = user.value?.name || ''
  userEmail.value = user.value?.email || ''
})
</script>

<template>
  <div class="size-full bg-gray-50 overflow-auto">
    <div class="w-full sm:w-96 my-8 px-4 sm:mx-auto flex flex-col gap-8">
      <div class="-mb-6">
        <span
          class="float-right uppercase font-bold text-gray-500 text-xs cursor-pointer"
          @click="setLanguage()"
        >
          {{ t('language') }}
        </span>
      </div>

      <nuxt-link :to="{ path: '/' }">
        <img
          class="mx-auto h-24 w-24"
          src="/logo.png"
        >
      </nuxt-link>

      <n-card
        v-if="!token"
        :title="t('auth')"
      >
        <nuxt-link
          v-for="provider in authProviders"
          :key="provider.value"
          :to="provider.to"
          class="flex items-center py-2 border-b last-of-type:border-b-0 gap-2"
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
          :placeholder="t('userName')"
        />

        <n-input
          v-model:value="userEmail"
          class="mt-2"
          type="email"
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
          v-for="type in types"
          :key="type.value"
          class="py-2 border-b last-of-type:border-b-0 flex justify-between items-center"
        >
          {{ t(`typeLabel-${type.value}`) }}

          <n-switch
            v-model:value="type.selected"
            :disabled="type.disabled || !token"
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
          :key="p"
          class="max-w-72"
          trigger="manual"
          placement="left"
          :show="token && plan === p"
        >
          <template #trigger>
            <div
              class="price"
              :class="{ active: plan === p }"
              @click="plan = p"
            >
              {{ t(`price${p}label`) }}
              <span class="float-end">
                {{ t(`price${p}price`) }}
              </span>
            </div>
          </template>

          <my-markdown
            class="text-sm"
            :source="t(`price${p}info`)"
          />
        </n-popover>

        <template #footer>
          <my-markdown
            class="mt-2 text-sm"
            :source="t('priceInfo')"
          />
        </template>
      </n-card>

      <n-button
        v-if="token"
        secondary
        size="large"
        strong
        type="success"
        :disabled="!token || !databaseName || !userName || !userEmail"
        @click="createDatabase()"
      >
        {{ t('create') }}
      </n-button>
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
      Name can contain only letters and underscores. It must start with a letter.

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

    price: Package
    priceInfo: |
      Price per month including VAT.

      You can see a full list of package options and limitations at [entu.ee](https://www.entu.ee/en/#price).
    price1price: Free
    price1label: 1,000 objects
    price1info: |
      - Up to 1,000 objects
      - Up to 100MB storage
      - Unlimited users
    price2price: 10 €
    price2label: 10,000 objects
    price2info: |
      - Up to 10,000 objects
      - Up to 1GB storage
      - Unlimited users
      - Daily backup
    price3price: 40 €
    price3label: 100,000 objects
    price3info: |
      - Up to 100,000 objects
      - Up to 5GB storage
      - Unlimited users
      - Daily backup
      - ID-card and Mobile-ID authentication
      - Own domain
    price4price: 200 €
    price4label: 500,000 objects
    price4info: |
      - Up to 500,000 objects
      - Up to 50GB storage
      - Unlimited users
      - Daily backup
      - ID-card and Mobile-ID authentication
      - Own domain
      - Priority support
    create: Create Database
  et:
    language: English
    title: Loo uus andmebaas
    databaseName: Andmebaasi nimi
    databaseInfo: |
      Nimi võib sisaldada ainult tähti ja allkriipse ning see peab algama tähega.

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

    price: Pakett
    priceInfo: |
      Hind kuus koos käibemaksuga.

      Täieliku nimekirja pakettide võimaluste ja piirangutega saate vaadata aadressil [entu.ee](https://www.entu.ee/#price).
    price1price: Tasuta
    price1label: 1000 objekti
    price1info: |
      - Kuni 1000 objekti
      - Kuni 100MB andmeid
      - Piiramatult kasutajaid
    price2price: 10 €
    price2label: 10 000 objekti
    price2info: |
      - Kuni 10 000 objekti
      - Kuni 1GB andmeid
      - Piiramatult kasutajaid
      - Igapäevane varukoopia
    price3price: 40 €
    price3label: 100 000 objekti
    price3info: |
      - Kuni 100 000 objekti
      - Kuni 5GB andmeid
      - Piiramatult kasutajaid
      - Igapäevane varukoopia
      - ID-kaardi ja Mobiil-ID tugi
      - Oma aadress
    price4price: 200 €
    price4label: 500 000 objekti
    price4info: |
      - Kuni 500 000 objekti
      - Kuni 50GB andmeid
      - Piiramatult kasutajaid
      - Igapäevane varukoopia
      - ID-kaardi ja Mobiil-ID tugi
      - Oma aadress
      - Personaalteenindus
    create: Loo andmebaas
</i18n>
