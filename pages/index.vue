<script setup>
const { accounts } = useAccount()

onMounted(async () => {
  const path = accounts.value?.at(0)?.account

  if (!path) return

  await navigateTo({ path: `/${path}` })
})
</script>

<template>
  <div />
</template>
