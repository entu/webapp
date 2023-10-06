<script setup>
import { NSpin } from 'naive-ui'

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
  <n-spin
    class="h-full w-full"
    :show="isLoading"
    :delay="1000"
  />
</template>

<i18n lang="yaml">
  en:
    error404: File not found
  et:
    error404: Faili ei leitud
</i18n>
