<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NProgress, NSpace } from 'naive-ui'

import { useStore } from '@/store'

const route = useRoute()
const store = useStore()

const entities = computed(() => Math.round(store.accountStats?.entities * 100 / (store.accountStats?.entities + store.accountStats?.deletedEntities)))
const properties = computed(() => Math.round(store.accountStats?.properties * 100 / (store.accountStats?.properties + store.accountStats?.deletedProperties)))
const files = computed(() => Math.round(store.accountStats?.filesSize * 100 / (store.accountStats?.filesSize + store.accountStats?.deletedFilesSize)))
const db = computed(() => Math.round(store.accountStats?.dbSize * 100 / (store.accountStats?.dbSize + store.accountStats?.filesSize + store.accountStats?.deletedFilesSize)))

watch(() => store.account, (value) => {
  store.getAccountStats()
}, { deep: true })

function humanFileSize (bytes, si = true, dp = 2) {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return bytes.toLocaleString('et', { minimumFractionDigits: dp, maximumFractionDigits: dp }) + ' ' + units[u]
}
</script>

<template>
  <div
    class="h-full w-1/3 min-w-fit mx-auto flex flex-col justify-center"
    vertical
  >
    <div class="my-3">
      <n-space justify="space-between">
        <div>Entities</div>
        <div class="text-stone-400">
          deleted
        </div>
      </n-space>
      <n-progress
        class="my-1"
        color="rgb(23,162,184)"
        rail-color="rgba(23,162,184,.3)"
        :height="18"
        :border-radius="4"
        :fill-border-radius="0"
        :show-indicator="false"
        :percentage="entities"
      >
        <span style="text-align: center">
          Entities
        </span>
      </n-progress>
      <n-space justify="space-between">
        <div>{{ store.accountStats?.entities?.toLocaleString('et') }}</div>
        <div class="text-stone-400">
          {{ store.accountStats?.deletedEntities?.toLocaleString('et') }}
        </div>
      </n-space>
    </div>

    <div class="my-3">
      <n-space justify="space-between">
        <div>Properties</div>
        <div class="text-stone-400">
          deleted
        </div>
      </n-space>
      <n-progress
        class="my-1"
        color="rgb(255,193,7)"
        rail-color="rgba(255,193,7,.3)"
        :height="18"
        :border-radius="4"
        :fill-border-radius="0"
        :show-indicator="false"
        :percentage="properties"
      />
      <n-space justify="space-between">
        <div>{{ store.accountStats?.properties?.toLocaleString('et') }}</div>
        <div class="text-stone-400">
          {{ store.accountStats?.deletedProperties?.toLocaleString('et') }}
        </div>
      </n-space>
    </div>

    <div class="my-3">
      <n-space justify="space-between">
        <div>Files</div>
        <div class="text-stone-400">
          deleted
        </div>
      </n-space>
      <n-progress
        class="my-1"
        color="rgb(40,167,69)"
        rail-color="rgba(40,167,69,.3)"
        :height="18"
        :border-radius="4"
        :fill-border-radius="0"
        :show-indicator="false"
        :percentage="files"
      />
      <n-space justify="space-between">
        <div>{{ humanFileSize(store.accountStats?.filesSize) }}</div>
        <div class="text-stone-400">
          {{ humanFileSize(store.accountStats?.deletedFilesSize) }}
        </div>
      </n-space>
    </div>

    <div class="my-3">
      <n-space justify="space-between">
        <div>Database</div>
        <div class="text-stone-400">
          total usage
        </div>
      </n-space>
      <n-progress
        class="my-1"
        color="rgb(108,117,125)"
        rail-color="rgba(108,117,125,.3)"
        :height="18"
        :border-radius="4"
        :fill-border-radius="0"
        :show-indicator="false"
        :percentage="db"
      />
      <n-space justify="space-between">
        <div>{{ humanFileSize(store.accountStats?.dbSize) }}</div>
        <div class="text-stone-400">
          {{ humanFileSize(store.accountStats?.dbSize + store.accountStats?.filesSize + store.accountStats?.deletedFilesSize) }}
        </div>
      </n-space>
    </div>
  </div>
</template>
