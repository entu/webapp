<script setup>
const userStore = useUserStore()
const { accounts } = storeToRefs(userStore)

onMounted(async () => {
  await navigateTo({ path: `/${accounts.value?.[0]?.account || 'entu'}` })
})
</script>

<template>
  <div />
</template>
