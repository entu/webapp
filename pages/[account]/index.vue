<script setup>
const { t } = useI18n()
const route = useRoute()

const stats = ref()

const { accountId } = useAccount()
const { userId } = useUser()

const isQuery = computed(() => Object.keys(route.query).length > 0)

onMounted(async () => {
  useHead({ title: accountId.value })

  stats.value = await apiGet('account')
})
</script>

<template>
  <transition>
    <div
      v-if="userId"
      class="h-full flex flex-col"
    >
      <entity-toolbar v-if="isQuery" />

      <div
        v-if="!isQuery && stats"
        class="h-full w-full lg:w-1/2 xl:w-1/2 md:min-w-fit px-8 md:mx-auto flex flex-col justify-center"
        vertical
      >
        <stats-bar
          class="my-3"
          color="rgb(23,162,184)"
          rail-color="rgba(23,162,184,.3)"
          :a-label="t('entities')"
          :b-label="t('deleted')"
          :a-value="stats.entities"
          :b-value="stats.deletedEntities"
        />
        <stats-bar
          class="my-3"
          color="rgb(255,193,7)"
          rail-color="rgba(255,193,7,.3)"
          :a-label="t('properties')"
          :b-label="t('deleted')"
          :a-value="stats.properties"
          :b-value="stats.deletedProperties"
        />
        <stats-bar
          class="my-3"
          is-bytes
          color="rgb(40,167,69)"
          rail-color="rgba(40,167,69,.3)"
          :a-label="t('files')"
          :b-label="t('deleted')"
          :a-value="stats.filesSize"
          :b-value="stats.deletedFilesSize"
        />
        <stats-bar
          class="my-3"
          color="rgb(108,117,125)"
          rail-color="rgba(108,117,125,.3)"
          show-total
          :a-label="t('requests')"
          :b-label="t('limit')"
          :a-value="stats.dbSize"
          :b-value="Math.ceil(stats.dbSize / Math.pow(10, stats.dbSize.toString().length - 1)) * Math.pow(10, stats.dbSize.toString().length - 1) - stats.dbSize"
        />
      </div>
    </div>
  </transition>
</template>

<i18n lang="yaml">
  en:
    entities: Entities
    properties: Properties
    files: Files
    requests: Requests in day
    deleted: deleted
    limit: limit
  et:
    entities: Objekte
    properties: Parameetreid
    files: Faile
    requests: Päringuid päevas
    deleted: kustutatud
    limit: limiit
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
