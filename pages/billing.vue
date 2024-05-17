<script setup>
const { t } = useI18n()

definePageMeta({ layout: 'blank' })

onMounted(async () => {
  useHead({ title: t('title') })

  await navigateTo('https://billing.stripe.com/p/login/00g02XgGnc7F4lGeUU', { external: true, open: { target: '_blank' } })
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
