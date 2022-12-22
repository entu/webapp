<script setup>
import { useUserStore } from '~/stores/user.client'

const router = useRouter()
const userStore = useUserStore()

userStore.signOut()
router.push({ path: '/' })
</script>

<template>
  <div />
</template>
