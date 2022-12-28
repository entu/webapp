<script setup>
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

useHead({ title: 'Exit · Entu' })

onMounted(() => {
  userStore.signOut()
  router.push({ path: '/', query: {} })
})
</script>

<template>
  <div />
</template>
