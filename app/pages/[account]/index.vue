<script setup>
import { NSpin } from 'naive-ui'

const route = useRoute()
const { t } = useI18n()

const { accountId } = useAccount()
const { userId } = useUser()

const stats = ref()
const entityId = ref(route.params.entityId)
const isLoading = ref(false)
const newEntityId = ref()

const isQuery = computed(() => Object.keys(route.query).length > 0)

const drawerType = computed(() => userId.value ? route.hash.replace('#', '').split('-').at(0) : undefined)

const addTypeId = computed(() => userId.value ? route.hash.split('-').at(1) : undefined)

const showAddDrawer = computed({
  get: () => drawerType.value === 'add',
  set: (value) => { if (!value) onDrawerClose() }
})

async function onDrawerClose () {
  if (newEntityId.value) {
    await navigateTo({ path: `/${accountId.value}/${newEntityId.value}`, query: route.query, hash: undefined }, { replace: true })
  }
  else {
    await navigateTo({ path: route.path, query: route.query, hash: undefined }, { replace: true })

    loadEntity()
  }
}

watch(() => accountId.value, (value) => {
  if (value) {
    useHead({ title: accountId.value })
  }
}, { immediate: true })

async function loadEntity () {
  if (!userId.value || isQuery.value || entityId.value) return

  isLoading.value = true
  stats.value = await apiRequest()
  isLoading.value = false
}

onMounted(async () => {
  await loadEntity()
})
</script>

<template>
  <div class="relative flex h-full flex-col">
    <entity-toolbar />

    <div
      v-if="isLoading"
      class="flex size-full items-center justify-center"
    >
      <n-spin />
    </div>

    <transition>
      <div
        v-if="!isQuery && stats && !entityId"
        class="flex size-full flex-col gap-24 px-8 md:mx-auto md:min-w-fit lg:w-1/2 xl:w-1/2"
        vertical
      >
        <div class="flex grow flex-col justify-center">
          <my-stats-bar
            class="my-3"
            color="rgb(23,162,184)"
            deleted-color="rgba(23,162,184,.3)"
            :label="t('entities')"
            :usage="stats.entities.usage"
            :deleted="stats.entities.deleted"
            :limit="stats.entities.limit"
          />
          <my-stats-bar
            class="my-3"
            color="rgb(255,193,7)"
            deleted-color="rgba(255,193,7,.3)"
            :label="t('properties')"
            :usage="stats.properties.usage"
            :deleted="stats.properties.deleted"
          />
          <my-stats-bar
            class="my-3"
            is-bytes
            color="rgb(40,167,69)"
            deleted-color="rgba(40,167,69,.3)"
            :label="t('files')"
            :usage="stats.files.usage"
            :deleted="stats.files.deleted"
            :limit="stats.files.limit"
          />
          <my-stats-bar
            class="my-3"
            color="rgb(108,117,125)"
            deleted-color="rgba(108,117,125,.3)"
            show-total
            :label="t('requests')"
            :usage="stats.requests.usage"
            :limit="stats.requests.limit"
          />

          <changelog class="mt-24 border-t px-2 pt-2" />
        </div>

        <div class="pb-4 text-center text-sm text-gray-500">
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

<i18n lang="yaml">
  en:
    entities: Entities
    properties: Properties
    files: Files
    requests: Requests in this month
    terms: Terms of Service
    termsUrl: https://www.entu.app/terms
  et:
    entities: Objekte
    properties: Parameetreid
    files: Faile
    requests: Päringuid selles kuus
    terms: Kasutustingimused
    termsUrl: https://www.entu.app/et/tingimused
</i18n>

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
