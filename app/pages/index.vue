<script setup>
import { NButtonGroup, NSpin } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const { accounts } = useAccount()

const authProviderGroups = [
  [
    { value: 'passkey', icon: 'passkey' }
  ],
  [
    { value: 'e-mail', icon: 'e-mail' },
    { value: 'apple', icon: 'apple' },
    { value: 'google', icon: 'google' }
  ],
  [
    { value: 'smart-id', icon: 'smart-id' },
    { value: 'mobile-id', icon: 'mobile-id' },
    { value: 'id-card', icon: 'id-card' }
  ]
]

const isRedirecting = ref(false)
const dbStats = ref([])
const sortKey = ref()

function metricTotal (item) {
  const metric = item.stats?.[sortKey.value]

  if (!metric) return -1

  return (metric.usage ?? 0) + (metric.deleted ?? 0)
}

const sortedDbStats = computed(() => {
  if (!sortKey.value) return dbStats.value

  return [...dbStats.value].sort((a, b) => metricTotal(b) - metricTotal(a))
})

function loadAllStats () {
  dbStats.value = accounts.value.map((account) => ({ account, stats: null, loading: true }))

  for (const item of dbStats.value) {
    apiRequest(item.account._id)
      .then((stats) => {
        item.stats = stats
      })
      .catch(() => {})
      .finally(() => {
        item.loading = false
      })
  }
}

function setLanguage () {
  setLocale(locale.value === 'en' ? 'et' : 'en')
  reloadNuxtApp()
}

onMounted(async () => {
  if (!accounts.value?.length) return

  if (accounts.value.length === 1) {
    isRedirecting.value = true
    await navigateTo({ path: `/${accounts.value.at(0)._id}` })
    return
  }

  loadAllStats()
})
</script>

<template>
  <div
    v-if="accounts?.length"
    class="flex min-h-full flex-col"
  >
    <div class="flex w-full justify-end px-4 pt-4">
      <span
        class="cursor-pointer text-xs font-bold text-gray-500 uppercase"
        @click="setLanguage()"
      >
        {{ t('language') }}
      </span>
    </div>

    <div class="flex justify-center py-4">
      <a href="/">
        <img
          class="size-24"
          src="/logo.png"
        >
      </a>
    </div>

    <div
      v-if="isRedirecting"
      class="flex flex-1 items-center justify-center"
    >
      <n-spin />
    </div>

    <div
      v-else-if="dbStats.length"
      class="flex flex-1 flex-col"
    >
      <div class="flex flex-col items-center gap-1 px-4 pb-6 text-center">
        <div class="text-xl font-semibold">
          {{ t('selectTitle') }}
        </div>
        <div class="text-sm text-gray-500">
          {{ t('selectDescription') }}
        </div>
      </div>

      <div class="w-full px-4">
        <div class="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,18rem)] justify-center gap-3">
          <div
            v-for="{ account, stats, loading } in sortedDbStats"
            :key="account._id"
            class="flex flex-col rounded-lg border border-gray-200 bg-white p-3"
          >
            <div class="mb-2 truncate text-center text-lg font-medium">
              {{ account.name }}
            </div>

            <my-db-stats
              v-if="stats"
              interactive
              :stats="stats"
              @sort="sortKey = $event"
            />
            <div
              v-else-if="loading"
              class="flex min-h-72 flex-1 items-center justify-center"
            >
              <n-spin
                stroke="#9ca3af"
                :size="14"
              />
            </div>
            <div
              v-else
              class="py-3 text-center text-sm text-gray-400"
            >
              {{ t('loadError') }}
            </div>

            <div class="mt-auto flex justify-center pt-3">
              <my-button
                circle
                icon="arrow-right"
                @click="navigateTo(`/${account._id}`)"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-center pt-12">
          <my-button
            ghost
            icon="add"
            size="large"
            :label="t('new')"
            @click="navigateTo('/new')"
          />
        </div>
      </div>
    </div>

    <my-footer class="shrink-0 py-4" />
  </div>

  <div
    v-else
    class="flex min-h-full flex-col"
  >
    <div class="flex w-full justify-end px-4 pt-4">
      <span
        class="cursor-pointer text-xs font-bold text-gray-500 uppercase"
        @click="setLanguage()"
      >
        {{ t('language') }}
      </span>
    </div>

    <div class="flex justify-center py-4">
      <a href="/">
        <img
          class="size-24"
          src="/logo.png"
        >
      </a>
    </div>

    <div class="flex flex-col items-center gap-1 px-4 pb-6 text-center">
      <div class="text-xl font-semibold">
        {{ t('signInTitle') }}
      </div>
      <div class="max-w-72 text-sm text-gray-500">
        {{ t('signInDescription') }}
      </div>
    </div>

    <div class="mb-8 flex w-full flex-col gap-8 px-4 sm:mx-auto sm:w-72">
      <div class="flex flex-col gap-3">
        <n-button-group
          v-for="(group, index) in authProviderGroups"
          :key="index"
          class="flex! w-full flex-col"
          vertical
        >
          <my-button
            v-for="provider in group"
            :key="provider.value"
            class="w-full justify-start! px-6!"
            size="large"
            :icon="provider.icon"
            :label="t(`auth-${provider.value}`)"
            @click="navigateTo(`/auth/${provider.value}`)"
          />
        </n-button-group>
      </div>

      <my-button
        block
        ghost
        icon="add"
        size="large"
        :label="t('new')"
        @click="navigateTo('/new')"
      />
    </div>

    <my-footer class="mt-auto mb-4" />
  </div>
</template>

<style scoped>
/* Group corners match a standalone button's visible radius (half of the 2.5rem button height) */
.n-button-group :deep(.n-button) {
  border-radius: 0;
}

.n-button-group :deep(.n-button:first-child) {
  border-top-left-radius: 1.25rem;
  border-top-right-radius: 1.25rem;
}

.n-button-group :deep(.n-button:last-child) {
  border-bottom-left-radius: 1.25rem;
  border-bottom-right-radius: 1.25rem;
}
</style>

<i18n lang="yaml">
  en:
    language: Eesti keel
    signInTitle: Sign in to Entu
    signInDescription: Choose how you want to sign in. You will be taken to your databases.
    auth-passkey: Passkey
    auth-e-mail: E-mail
    auth-google: Google
    auth-apple: Apple
    auth-smart-id: Smart-ID
    auth-mobile-id: Mobile-ID
    auth-id-card: ID-Card
    new: Create New Database
    selectTitle: Select a database
    selectDescription: You have access to multiple databases. Choose one to continue.
    loadError: Could not load stats
  et:
    language: English
    signInTitle: Sisene Entusse
    signInDescription: Vali, kuidas soovid sisse logida. Seejärel jõuad oma andmebaasidesse.
    auth-passkey: Turvavõti
    auth-e-mail: E-post
    auth-google: Google
    auth-apple: Apple
    auth-smart-id: Smart-ID
    auth-mobile-id: Mobiil-ID
    auth-id-card: ID-kaart
    new: Loo uus andmebaas
    selectTitle: Vali andmebaas
    selectDescription: Sul on ligipääs mitmele andmebaasile. Vali üks jätkamiseks.
    loadError: Statistika laadimine ebaõnnestus
</i18n>
