<script setup>
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

definePageMeta({ layout: 'no-menu' })
useHead({ title: 'Entu · Exit' })

userStore.signOut()
router.push({ path: '/' })
</script>

<template>
  <div />
</template>
