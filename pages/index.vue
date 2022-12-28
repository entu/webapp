<script setup>
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()
const { accounts } = storeToRefs(userStore)

onMounted(() => {
  router.push({ path: `/${accounts.value?.[0]?.account || 'entu'}` })
})
</script>

<template>
  <div />
</template>
