<script setup>
import { useUserStore } from '~/stores/user'

definePageMeta({ layout: 'no-menu' })
useHead({ title: 'Entu · Exit' })

const router = useRouter()
const userStore = useUserStore()

userStore.signOut()
router.push({ path: '/' })
</script>

<template>
  <div />
</template>
