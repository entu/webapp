<script setup>
import { useUserStore } from '~/stores/user.client'

const userStore = useUserStore()
const { account } = storeToRefs(userStore)

useHead({ title: `Entu · ${account.value}` })
</script>

<template>
  <div />
</template>
