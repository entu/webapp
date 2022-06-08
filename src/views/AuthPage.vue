<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useStore } from '@/store'

const router = useRouter()
const route = useRoute()
const store = useStore()

onMounted(async () => {
  if (route.params.id === 'exit') {
    store.logOut()
    router.push({ name: 'home' })
  } else if (route.query.key) {
    await store.getAccounts(route.query.key)
    router.push({ name: 'stats', params: { account: store.accounts[0].account } })
  } else {
    window.location = `${import.meta.env.VITE_APP_API_URL}/auth/google?next=${window.location.origin}/auth/?key=`
  }
})
</script>

<template>
  <div />
</template>
