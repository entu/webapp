<script setup>
const { locale, t } = useI18n()

onMounted(async () => {
  useHead({ title: t('title') })

  const { billingUrl } = await apiRequest('billing')

  if (!billingUrl) {
    showError({ statusCode: 404, message: t('error404') })
    return
  }

  await navigateTo(`${billingUrl}?locale=${locale.value}`, { external: true })
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
