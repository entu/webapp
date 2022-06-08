<script setup>
import { watch, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NLayout } from 'naive-ui'

import { useStore } from '@/store'
import LeftMenu from '@/components/LeftMenu.vue'
import SearchInput from '@/components/SearchInput.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()

const search = ref('')

onMounted(async () => {
  store.account = route.params.account
  search.value = route.query.q
  store.getMenu()
})

watch(() => route.params.account, (value) => {
  store.account = route.params.account
  store.getMenu()
})

watch(() => route.query.q, (value) => {
  search.value = value
})

watch(() => search.value, (value) => {
  if (!value) {
    const newQuery = { ...route.query }
    delete newQuery.q
    router.replace({ query: newQuery })
  } else {
    router.replace({ query: { ...route.query, q: value } })
  }
})
</script>

<template>
  <n-layout
    class="h-full w-full"
    has-sider
  >
    <left-menu
      :menu="store.menu"
      :accounts="store.accounts"
      :is-authenticated="store.isAuthenticated"
    />
    <div class="w-full flex flex-col">
      <div class="h-12 flex items-center justify-between border-b border-slate-300">
        <search-input
          v-model="search"
          class="w-64"
        />
      </div>
      <div
        class="grow  overflow-y-auto"
      >
        <router-view />
      </div>
    </div>
  </n-layout>
</template>
