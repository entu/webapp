<script setup>
const { locale, t } = useI18n()

onMounted(async () => {
  useHead({ title: t('title') })

  try {
    const { url } = await apiRequest('billing')

    await navigateTo(`${url}?locale=${locale.value}`, { external: true })
  } catch (error) {
    showError({ statusCode: 404, message: t('error404') })
  }
})
</script>

<template>
  <div />
</template>

<i18n lang="yaml">
  en:
    title: Billing
    error404: Page not found
  et:
    title: Arveldus
    error404: Lehte ei leitud
</i18n>
