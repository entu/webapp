<script setup>
import { NAlert, NButton, NCard, NInput, NSpin } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const route = useRoute()

const databaseName = ref('')
const sessionId = ref(null)
const isSettingUp = ref(false)
const error = ref()

const isValidForm = computed(() => databaseName.value.length >= 4 && databaseName.value.length <= 12)

const pricingTableId = computed(() => {
  const tables = Object.fromEntries(
    (runtimeConfig.public.stripePricingTableIds || '').split(',').map((s) => s.split(':'))
  )

  return tables[locale.value] || tables.en || ''
})

const successUrl = computed(() => `${window.location.origin}/new?session={CHECKOUT_SESSION_ID}`)

function validateName () {
  databaseName.value = databaseName.value?.replace(/[^a-z0-9_]/gi, '').toLowerCase()

  while (databaseName.value && (/^[_0-9]/.test(databaseName.value))) {
    databaseName.value = databaseName.value.slice(1)
  }
}

async function createDatabase () {
  isSettingUp.value = true
  error.value = undefined

  try {
    const res = await $fetch(`${runtimeConfig.public.apiUrl}/new`, {
      method: 'PUT',
      body: { database: databaseName.value, sessionId: sessionId.value }
    })

    if (res.inviteToken) {
      navigateTo(`/${res.db}/invite?token=${res.inviteToken}`)
    }
  }
  catch (e) {
    error.value = e.data?.statusMessage || e.message
    isSettingUp.value = false
  }
}

function setLanguage () {
  if (databaseName.value) {
    sessionStorage.setItem('new-database', databaseName.value)
  }

  setLocale(locale.value === 'en' ? 'et' : 'en')
  reloadNuxtApp()
}

onMounted(() => {
  useHead({
    title: t('title'),
    script: [{ src: 'https://js.stripe.com/v3/pricing-table.js', async: true }]
  })

  const savedName = sessionStorage.getItem('new-database')

  if (savedName) {
    databaseName.value = savedName
    sessionStorage.removeItem('new-database')
  }

  if (route.query.session) {
    sessionId.value = route.query.session
  }
})
</script>

<template>
  <div class="flex min-h-full flex-col overflow-auto bg-gray-50">
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

    <div
      v-if="isSettingUp"
      class="mb-8 flex w-full flex-col gap-8 px-4 sm:mx-auto sm:w-96"
    >
      <n-card :title="t('pendingTitle')">
        <div class="flex flex-col gap-8 py-8">
          <my-markdown
            class="text-sm"
            :source="t('pendingInfo')"
          />
          <div class="flex justify-center">
            <n-spin size="medium" />
          </div>
        </div>
      </n-card>
    </div>

    <div
      v-else-if="sessionId"
      class="mb-8 flex w-full flex-col gap-8 px-4 sm:mx-auto sm:w-96"
    >
      <n-card :title="t('title')">
        <n-input
          v-model:value="databaseName"
          autofocus
          :placeholder="t('databaseName')"
          @input="validateName()"
        />

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

      <n-button
        secondary
        size="large"
        strong
        type="success"
        :disabled="!isValidForm"
        @click="createDatabase()"
      >
        {{ t('create') }}
      </n-button>
    </div>

    <div
      v-else
      class="mb-8 flex w-full flex-col gap-8"
    >
      <div class="mx-auto w-full max-w-2xl px-4 text-center">
        <p class="mb-3 text-2xl font-bold text-gray-900">
          {{ t('pricingTitle') }}
        </p>
        <my-markdown
          class="text-base text-gray-900"
          :source="t('pricingInfo')"
        />
      </div>

      <div class="w-full border-y border-[#efeff5] bg-white pt-8">
        <stripe-pricing-table
          :pricing-table-id="pricingTableId"
          :publishable-key="runtimeConfig.public.stripePublishableKey"
          :success-url="successUrl"
        />
      </div>
    </div>

    <div class="mt-auto mb-4 px-4 text-center text-sm text-gray-500">
      <a
        target="_blank"
        :href="t('docsUrl')"
      >{{ t('docs') }}</a>

      <span class="mx-2">&middot;</span>

      <a
        target="_blank"
        :href="t('pricingUrl')"
      >{{ t('pricing') }}</a>

      <span class="mx-2">&middot;</span>

      <a
        target="_blank"
        :href="t('termsUrl')"
      >{{ t('terms') }}</a>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    language: Eesti keel
    title: Choose your database name
    databaseName: Database name
    databaseInfo: Database name can contain only letters and underscores, must start with a letter, be 4–12 characters long, and cannot be changed later.
    create: Create Database
    pricingTitle: Create a new Entu database
    pricingInfo: "Choose a plan to start your free trial. Subscriptions and payments are handled securely by Stripe. Once your billing details are confirmed, you'll be able to choose your database name and create your first user account."
    pendingTitle: Creating your database
    pendingInfo: We are creating your database. This takes just a moment, you will be redirected automatically.
    error: Error
    terms: Terms of Service
    termsUrl: https://entu.ee/terms/
    pricing: Pricing
    pricingUrl: https://entu.ee/#pricing
    docs: Documentation
    docsUrl: https://entu.ee/overview/
  et:
    language: English
    title: Valige andmebaasi nimi
    databaseName: Andmebaasi nimi
    databaseInfo: Andmebaasi nimi võib sisaldada ainult tähti ja allkriipse, peab algama tähega, olema 4–12 tähemärki pikk ning seda ei saa hiljem muuta.
    create: Loo andmebaas
    pricingTitle: Loo uus Entu andmebaas
    pricingInfo: "Valige pakett tasuta prooviperioodi alustamiseks. Tellimused ja maksed haldab turvaliselt Stripe. Pärast arveldusandmete kinnitamist saate valida andmebaasi nime ja luua oma esimese kasutajakonto."
    pendingTitle: Loome teie andmebaasi
    pendingInfo: Loome teie andmebaasi. See võtab vaid hetke, teid suunatakse automaatselt edasi.
    error: Viga
    terms: Kasutustingimused
    termsUrl: https://entu.ee/et/terms/
    pricing: Hinnad
    pricingUrl: https://entu.ee/et/#hinnad
    docs: Dokumentatsioon
    docsUrl: https://entu.ee/et/overview/
</i18n>
