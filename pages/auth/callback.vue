<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'

definePageMeta({ layout: 'no-menu' })
useHead({ title: 'Entu · Sign In Callback' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { accounts } = storeToRefs(userStore)

await userStore.getAccounts(route.query.key)

if (accounts.value.length > 0) {
  router.push({ path: `/${accounts.value[0].account}`, params: { _: '123' } })
} else {
  router.push({ path: '/' })
}
</script>

<template>
  <div />
</template>
