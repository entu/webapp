<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useStore } from '@/store'

const router = useRouter()
const store = useStore()

if (router.currentRoute.value.query?.key) {
  openAccount(router.currentRoute.value.query?.key)
} else {
  window.location = `${import.meta.env.VITE_APP_API_URL}/auth/google?next=${window.location.origin}/auth/?key=`
}

async function openAccount (key) {
  await store.getAccounts(key)
  router.push({ name: 'account', params: { account: store.accounts[0].account } })
}
</script>

<template>
  <div />
</template>
