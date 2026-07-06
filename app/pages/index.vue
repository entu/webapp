<script setup>
import { NSpin } from 'naive-ui'

definePageMeta({
  layout: 'default',
  middleware () {
    if (useAccount().accounts.value?.length) {
      setPageLayout('blank')
    }
  }
})

const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const { accounts, showMobileMenu } = useAccount()

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
    class="flex min-h-full flex-col overflow-auto bg-gray-50"
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
      </div>
    </div>

    <div class="shrink-0 p-4 text-center text-sm text-gray-500">
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

  <div
    v-else
    class="relative flex h-full flex-col"
  >
    <change-log class="absolute right-3 hidden max-w-80 md:block" />

    <div class="flex flex-1 items-center justify-center p-6">
      <div class="flex w-64 flex-col gap-4">
        <div class="md:hidden">
          <my-button
            block
            size="large"
            type="info"
            :label="t('signIn')"
            @click="showMobileMenu = true"
          />
        </div>

        <my-button
          block
          icon="add"
          secondary
          size="large"
          :label="t('new')"
          @click="navigateTo('/new')"
        />
      </div>
    </div>

    <div class="shrink-0 p-4 text-center text-sm text-gray-500">
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
    signIn: Sign In
    new: Create New Database
    selectTitle: Select a database
    selectDescription: You have access to multiple databases. Choose one to continue.
    loadError: Could not load stats
    docs: Documentation
    docsUrl: https://entu.ee/overview/
    pricing: Pricing
    pricingUrl: https://entu.ee/#pricing
    terms: Terms of Service
    termsUrl: https://entu.ee/terms/
  et:
    language: English
    signIn: Sisene
    new: Loo uus andmebaas
    selectTitle: Vali andmebaas
    selectDescription: Sul on ligipääs mitmele andmebaasile. Vali üks jätkamiseks.
    loadError: Statistika laadimine ebaõnnestus
    docs: Dokumentatsioon
    docsUrl: https://entu.ee/et/overview/
    pricing: Hinnad
    pricingUrl: https://entu.ee/et/#hinnad
    terms: Kasutustingimused
    termsUrl: https://entu.ee/et/terms/
</i18n>
