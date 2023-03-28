<script setup>
const route = useRoute()

onMounted(async () => {
  const { url } = await apiGetProperty(route.params.fileId)

  if (!url) return

  location = url
})
</script>

<template>
  <div />
</template>
