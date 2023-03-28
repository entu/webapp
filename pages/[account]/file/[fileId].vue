<script setup>
const route = useRoute()

definePageMeta({ layout: 'blank' })

onMounted(async () => {
  const { url } = await apiGetProperty(route.params.fileId)

  if (!url) return

  await navigateTo(url, { external: true })
})
</script>

<template>
  <div />
</template>
