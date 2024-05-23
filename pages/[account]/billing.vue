<script setup>
const { locale, t } = useI18n()

definePageMeta({ layout: 'blank' })

onMounted(async () => {
  useHead({ title: t('title') })

  const { url } = await apiRequest('billing')

  await navigateTo(`${url}?locale=${locale.value}`, { external: true })
})
</script>

<template>
  <div />
</template>

<i18n lang="yaml">
  en:
    title: Billing
  et:
    title: Arveldus
</i18n>
