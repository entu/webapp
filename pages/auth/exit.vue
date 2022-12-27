<script setup>
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

useHead({ title: 'Exit · Entu' })

userStore.signOut()
router.push({ path: '/' })
</script>

<template>
  <div />
</template>
