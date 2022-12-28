<script setup>
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  useHead({ title: 'Exit' })

  userStore.signOut()
  router.push({ path: '/', query: {} })
})
</script>

<template>
  <div />
</template>
