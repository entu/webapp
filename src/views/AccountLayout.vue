<script setup>
import { watch, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NLayout } from 'naive-ui'

import { useStore } from '@/store'
import { apiGetEntities } from '@/api'
import LeftMenu from '@/components/LeftMenu.vue'
import SearchInput from '@/components/SearchInput.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const search = ref('')
const menu = ref([])

onMounted(() => {
  store.account = route.params.account
  search.value = route.query.q

  loadMenu()
})

watch(() => route.params.account, (value) => {
  store.account = value

  if (value) {
    loadMenu()
  }
})

watch(() => route.query, (value) => {
  if (Object.keys(value).length === 0) {
    router.replace({ name: 'stats', params: { account: route.params.account } })
  } else {
    search.value = value.q
  }
})

watch(() => search.value, (value) => {
  if (value) {
    router.replace({ name: 'entity', params: { entity: '_', ...route.params }, query: { ...route.query, q: value } })
  } else {
    const newQuery = { ...route.query }
    delete newQuery.q

    router.replace({ name: route.name, params: route.params, query: newQuery })
  }
})

async function loadMenu () {
  menu.value = await apiGetEntities({
    '_type.string': 'menu',
    props: [
      'ordinal.integer',
      'group.string',
      'group.language',
      'name.string',
      'name.language',
      'query.string'
    ].join(',')
  })
}
</script>

<template>
  <n-layout
    class="h-full w-full"
    has-sider
  >
    <left-menu
      :menu="menu"
      :accounts="store.accounts"
      :is-authenticated="store.isAuthenticated"
    />
    <div class="w-full flex flex-col">
      <div class="h-12 flex items-center justify-between border-b border-slate-300">
        <search-input v-model="search" />
      </div>
      <div class="grow w-full flex overflow-hidden">
        <router-view />
      </div>
    </div>
  </n-layout>
</template>
