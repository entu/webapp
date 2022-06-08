<script setup>
import { watch } from 'vue'

import { useStore } from '@/store'
import StatsBar from '@/components/StatsBar.vue'

const store = useStore()

watch(() => store.account, (value) => {
  if (!store.isAuthenticated) { return }

  store.getAccountStats()
}, { deep: true })
</script>

<template>
  <div
    v-if="store.isAuthenticated"
    class="h-full w-full lg:w-1/2 xl:w-1/3 md:min-w-fit px-8 md:mx-auto flex flex-col justify-center"
    vertical
  >
    <stats-bar
      class="my-3"
      color="rgb(23,162,184)"
      rail-color="rgba(23,162,184,.3)"
      a-label="Entities"
      b-label="deleted"
      :a-value="store.accountStats.entities"
      :b-value="store.accountStats.deletedEntities"
    />
    <stats-bar
      class="my-3"
      color="rgb(255,193,7)"
      rail-color="rgba(255,193,7,.3)"
      a-label="Properties"
      b-label="deleted"
      :a-value="store.accountStats.properties"
      :b-value="store.accountStats.deletedProperties"
    />
    <stats-bar
      class="my-3"
      color="rgb(40,167,69)"
      rail-color="rgba(40,167,69,.3)"
      a-label="Files"
      b-label="deleted"
      :a-value="store.accountStats.files"
      :b-value="store.accountStats.deletedFiles"
    />
    <stats-bar
      class="my-3"
      is-bytes
      show-total
      color="rgb(108,117,125)"
      rail-color="rgba(108,117,125,.3)"
      a-label="Database"
      b-label="total usage"
      :a-value="store.accountStats.dbSize"
      :b-value="store.accountStats.filesSize + store.accountStats.deletedFilesSize"
    />
  </div>
</template>
