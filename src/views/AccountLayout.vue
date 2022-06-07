<script setup>
import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NLayout, NLayoutContent } from 'naive-ui'

import { useStore } from '@/store'
import LeftMenu from '@/components/LeftMenu.vue'

const store = useStore()
const route = useRoute()

onMounted(async () => {
  store.account = route.params.account
  store.getMenu()
})

watch(() => route.params.account, (value) => {
  store.account = route.params.account
  store.getMenu()
})
</script>

<template>
  <n-layout
    position="absolute"
    has-sider
  >
    <left-menu
      :menu="store.menu"
      :accounts="store.accounts"
      :is-authenticated="store.isAuthenticated"
    />
    <n-layout>
      <n-layout-content
        position="absolute"
        content-style="height:100%"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
