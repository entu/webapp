<script setup>
import { NSpin } from 'naive-ui'

const route = useRoute()
const { t } = useI18n()

const { accountId, showMobileMenu } = useAccount()
const { userId } = useUser()

const stats = ref()
const isLoading = ref(false)
const newEntityId = ref()

const isQuery = computed(() => Object.keys(route.query).length > 0)

const drawerType = computed(() => userId.value ? route.hash.replace('#', '').split('-').at(0) : undefined)

const addTypeId = computed(() => userId.value ? route.hash.split('-').at(1) : undefined)

const showAddDrawer = computed({
  get: () => {
    if (drawerType.value === 'add') {
      useAnalytics('show_add')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})

async function onDrawerClose () {
  if (newEntityId.value) {
    await navigateTo({ path: `/${accountId.value}/${newEntityId.value}`, query: route.query, hash: undefined }, { replace: true })
  }
  else {
    await navigateTo({ path: route.path, query: route.query, hash: undefined }, { replace: true })

    loadStats()
  }
}

watch(accountId, (value) => {
  if (!value) return

  useHead({ title: accountId.value })
}, { immediate: true })

async function loadStats () {
  if (!userId.value || isQuery.value) return

  isLoading.value = true
  stats.value = await apiRequest()
  isLoading.value = false
}

onMounted(async () => {
  await loadStats()
})
</script>

<template>
  <div class="relative flex h-full flex-col">
    <template v-if="!userId && !isQuery">
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
    </template>

    <div
      v-if="isLoading"
      class="flex size-full items-center justify-center"
    >
      <n-spin />
    </div>

    <transition>
      <div
        v-if="!isQuery && stats"
        class="flex size-full flex-col gap-8 px-2 md:mx-auto md:max-w-lg"
        vertical
      >
        <div class="flex grow flex-col justify-center">
          <my-db-stats :stats="stats" />
        </div>

        <div class="pb-4 text-center text-sm text-gray-500">
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
    </transition>

    <entity-drawer-edit
      v-model:entity-id="newEntityId"
      v-model:show="showAddDrawer"
      :entity-type-id="addTypeId"
    />
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

<i18n lang="yaml">
  en:
    signIn: Sign In
    new: Create New Database
    terms: Terms of Service
    termsUrl: https://entu.ee/terms/
    pricing: Pricing
    pricingUrl: https://entu.ee/#pricing
    docs: Documentation
    docsUrl: https://entu.ee/overview/
  et:
    signIn: Sisene
    new: Loo uus andmebaas
    terms: Kasutustingimused
    termsUrl: https://entu.ee/et/terms/
    pricing: Hinnad
    pricingUrl: https://entu.ee/et/#hinnad
    docs: Dokumentatsioon
    docsUrl: https://entu.ee/et/overview/
</i18n>
