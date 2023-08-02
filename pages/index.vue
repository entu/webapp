<script setup>
const { accounts } = useAccount()

onMounted(async () => {
  await navigateTo({ path: `/${accounts.value?.at(0)?.account || 'entu'}` })
})
</script>

<template>
  <div />
</template>
