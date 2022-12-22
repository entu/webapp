<script setup>
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const { account } = storeToRefs(userStore)

useHead({ title: `Entu · ${account.value}` })

watch(() => account.value, () => useHead({ title: `Entu · ${account.value}` }))

onMounted(() => {
  if (!account.value) location.reload()
})
</script>

<template>
  <div />
</template>
