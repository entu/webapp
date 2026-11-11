<script setup>
definePageMeta({ layout: 'blank' })

const { d, t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const { accounts, supportAccounts } = useAccount()

const providerGroups = authProviderGroups()

const isRedirecting = ref(false)
const dbStats = ref([])
const supportStats = ref([])
const sortKey = ref()

const activeSupportAccounts = computed(() => supportAccounts.value.filter((x) => new Date(x.until).getTime() > Date.now()))
const hasDatabases = computed(() => accounts.value?.length > 0 || activeSupportAccounts.value.length > 0)

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
  supportStats.value = activeSupportAccounts.value.map((account) => ({ account, stats: null, loading: true }))

  for (const item of [...dbStats.value, ...supportStats.value]) {
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
  if (!hasDatabases.value) return

  if (accounts.value.length === 1 && activeSupportAccounts.value.length === 0) {
    isRedirecting.value = true
    await navigateTo({ path: `/${accounts.value.at(0)._id}` })
    return
  }

  loadAllStats()
})
</script>

<template>
  <div
    v-if="hasDatabases"
    class="flex min-h-full flex-col"
  >
    <div class="flex w-full justify-between px-4 pt-4">
      <nuxt-link
        class="text-xs font-bold text-red-600 uppercase dark:text-red-400"
        to="/auth/exit"
      >
        {{ t('signOut') }}
      </nuxt-link>

      <button
        class="cursor-pointer text-xs font-bold text-slate-600 uppercase dark:text-slate-300"
        type="button"
        :lang="locale === 'en' ? 'et' : 'en'"
        @click="setLanguage()"
      >
        {{ t('language') }}
      </button>
    </div>

    <div class="flex justify-center py-4">
      <a href="/">
        <img
          alt="Entu"
          class="size-24"
          src="/logo.png"
        >
      </a>
    </div>

    <div
      v-if="isRedirecting"
      class="flex flex-1 items-center justify-center"
    >
      <my-spinner />
    </div>

    <div
      v-else-if="dbStats.length || supportStats.length"
      class="flex flex-1 flex-col"
    >
      <div
        v-if="dbStats.length"
        class="flex flex-col items-center gap-1 px-4 pb-6 text-center"
      >
        <div class="text-xl font-semibold">
          {{ t('selectTitle') }}
        </div>
        <div class="text-sm text-slate-600 dark:text-slate-300">
          {{ t('selectDescription') }}
        </div>
      </div>

      <div class="w-full px-4">
        <div
          v-if="dbStats.length"
          class="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,18rem)] justify-center gap-3"
        >
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
              <my-spinner
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

        <template v-if="supportStats.length">
          <div
            class="flex flex-col items-center gap-1 px-4 pb-6 text-center"
            :class="{ 'pt-12': dbStats.length }"
          >
            <div class="text-xl font-semibold">
              {{ t('supportTitle') }}
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-300">
              {{ t('supportDescription') }}
            </div>
          </div>

          <div class="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,18rem)] justify-center gap-3">
            <div
              v-for="{ account, stats, loading } in supportStats"
              :key="account._id"
              class="flex flex-col rounded-lg border-2 border-orange-500 bg-surface p-3 dark:border-orange-400"
            >
              <div class="truncate text-center text-lg font-medium">
                {{ account.name }}
              </div>
              <div class="mb-2 text-center text-xs text-orange-600 dark:text-orange-400">
                {{ t('supportUntil', { date: d(new Date(account.until), 'datetime') }) }}
              </div>

              <my-db-stats
                v-if="stats"
                :stats="stats"
              />
              <div
                v-else-if="loading"
                class="flex min-h-72 flex-1 items-center justify-center"
              >
                <my-spinner
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
        </template>

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
    supportTitle: Support access
    supportDescription: These databases' owners have let Entu support in for a limited time.
    supportUntil: "Until {date}"
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
    supportTitle: Kasutajatoe ligipääs
    supportDescription: Nende andmebaaside omanikud on lubanud Entu kasutajatoe piiratud ajaks sisse.
    supportUntil: "Kuni {date}"
</i18n>
