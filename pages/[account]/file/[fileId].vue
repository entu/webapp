<script setup>
const route = useRoute()

definePageMeta({ layout: 'blank' })

const { t } = useI18n()

onMounted(async () => {
  const { url } = await apiGetProperty(route.params.fileId)

  if (!url) return showError({ statusCode: 404, statusMessage: t('error404') })

  await navigateTo(url, { external: true })
})
</script>

<template>
  <div />
</template>

<i18n lang="yaml">
  en:
    error404: File not found
  et:
    error404: Faili ei leitud
</i18n>
