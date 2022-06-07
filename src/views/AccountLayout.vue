<script setup>
import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NLayout, NLayoutContent, useLoadingBar, useNotification } from 'naive-ui'

import { useStore } from '@/store'
import LeftMenu from '@/components/LeftMenu.vue'

const store = useStore()
const route = useRoute()
const loadingBar = useLoadingBar()
const notification = useNotification()

onMounted(async () => {
  store.account = route.params.account
  store.getMenu()
})

watch(() => route.params.account, (value) => {
  store.account = route.params.account
  store.getMenu()
})

watch(() => store.apiIsLoading, (value) => {
  if (value) {
    if (!store.loadingBar) {
      store.loadingBar = true
      loadingBar.start()
    }
  } else {
    loadingBar.finish()
    store.loadingBar = false
  }
}, { deep: true })
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

<style scoped>
</style>
