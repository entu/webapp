<script setup>
import { watch } from 'vue'

import { useStore } from '@/store'
import StatsBar from '@/components/StatsBar.vue'

const store = useStore()

watch(() => store.account, (value) => {
  store.getAccountStats()
}, { deep: true })
</script>

<template>
  <div
    class="h-full w-1/3 min-w-fit mx-auto flex flex-col justify-center"
    vertical
  >
    <stats-bar
      class="my-3"
      color="rgb(23,162,184)"
      rail-color="rgba(23,162,184,.3)"
      a-label="Entities"
      b-label="deleted"
      :a-value="store.accountStats?.entities"
      :b-value="store.accountStats?.deletedEntities"
    />
    <stats-bar
      class="my-3"
      color="rgb(255,193,7)"
      rail-color="rgba(255,193,7,.3)"
      a-label="Properties"
      b-label="deleted"
      :a-value="store.accountStats?.properties"
      :b-value="store.accountStats?.deletedProperties"
    />
    <stats-bar
      class="my-3"
      is-bytes
      color="rgb(40,167,69)"
      rail-color="rgba(40,167,69,.3)"
      a-label="Files"
      b-label="deleted"
      :a-value="store.accountStats?.filesSize"
      :b-value="store.accountStats?.deletedFilesSize"
    />
    <stats-bar
      class="my-3"
      is-bytes
      color="rgb(108,117,125)"
      rail-color="rgba(108,117,125,.3)"
      a-label="Database"
      b-label="total usage"
      :a-value="store.accountStats?.dbSize"
      :b-value="store.accountStats?.filesSize + store.accountStats?.deletedFilesSize"
    />
  </div>
</template>
