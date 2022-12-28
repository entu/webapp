<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { accounts } = storeToRefs(userStore)

onMounted(async () => {
  useHead({ title: 'Sign In' })

  await userStore.getAccounts(route.query.key)

  if (accounts.value.length > 0) {
    router.push({ path: `/${accounts.value[0].account}`, query: {} })
  } else {
    router.push({ path: '/', query: {} })
  }
})
</script>

<template>
  <div />
</template>
