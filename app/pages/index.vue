<script setup>
import { NSpin } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const { accounts } = useAccount()

const providerGroups = authProviderGroups()

const isRedirecting = ref(false)
const dbStats = ref([])
const sortKey = ref()

function metricTotal (item) {
  const metric = item.stats?.[sortKey.value]

  if (!metric) {
    return -1
  }

  return (metric.usage ?? 0) + (metric.deleted ?? 0)
}

const sortedDbStats = computed(() => {
  if (!sortKey.value) {
    return dbStats.value
  }

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

function providerRoute (provider) {
  return `/auth/${provider.path}`
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
    <div class="flex w-full justify-between px-4 pt-4">
      <nuxt-link
        class="text-xs font-bold text-red-600 uppercase dark:text-red-400"
        to="/auth/exit"
      >
        {{ t('signOut') }}
      </nuxt-link>

      <span
        class="cursor-pointer text-xs font-bold text-slate-600 uppercase dark:text-slate-300"
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
        <div class="text-sm text-slate-600 dark:text-slate-300">
          {{ t('selectDescription') }}
        </div>
      </div>

      <div class="w-full px-4">
        <div class="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,18rem)] justify-center gap-3">
          <div
            v-for="{ account, stats, loading } in sortedDbStats"
            :key="account._id"
            class="flex flex-col rounded-lg border border-slate-200 bg-surface p-3 dark:border-slate-800"
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
                stroke="#90A1B9"
                :size="14"
              />
            </div>
            <div
              v-else
              class="py-3 text-center text-sm text-slate-400 dark:text-slate-500"
            >
              {{ t('loadError') }}
            </div>

            <div class="mt-auto flex justify-center pt-3">
              <my-button
                circle
                icon="arrow-right"
                :label="t('openDatabase')"
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

  <my-sign-in
    v-else
    :description="t('signInDescription')"
    :provider-groups="providerGroups"
    :provider-route="providerRoute"
    :title="t('signInTitle')"
  >
    <my-button
      block
      ghost
      icon="add"
      size="large"
      :label="t('new')"
      @click="navigateTo('/new')"
    />
  </my-sign-in>
</template>

<i18n lang="yaml">
  en:
    language: Eesti keel
    signOut: Sign Out
    signInTitle: Sign in to Entu
    signInDescription: Choose how you want to sign in. You will be taken to your databases.
    new: Create New Database
    selectTitle: Select a database
    selectDescription: You have access to multiple databases. Choose one to continue.
    loadError: Could not load stats
    openDatabase: Open Database
  et:
    language: English
    signOut: Välju
    signInTitle: Sisene Entusse
    signInDescription: Vali, kuidas soovid sisse logida. Seejärel jõuad oma andmebaasidesse.
    new: Loo uus andmebaas
    selectTitle: Vali andmebaas
    selectDescription: Sul on ligipääs mitmele andmebaasile. Vali üks jätkamiseks.
    loadError: Statistika laadimine ebaõnnestus
    openDatabase: Ava andmebaas
</i18n>
