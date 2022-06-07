<script setup>
import { watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLoadingBar } from 'naive-ui'

import { useStore } from '@/store'

const router = useRouter()
const route = useRoute()
const store = useStore()
const loadingBar = useLoadingBar()

onMounted(async () => {
  if (route.params.id === 'exit') {
    store.logOut()
    router.push({ name: 'home' })
  } else if (route.query?.key) {
    await store.getAccounts(route.query?.key)
    router.push({ name: 'stats', params: { account: store.accounts[0].account } })
  } else {
    window.location = `${import.meta.env.VITE_APP_API_URL}/auth/google?next=${window.location.origin}/auth/?key=`
  }
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
  <div />
</template>
