<script setup>
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

useHead({ title: 'Entu · Exit' })

userStore.signOut()
router.push({ path: '/' })
</script>

<template>
  <div />
</template>
