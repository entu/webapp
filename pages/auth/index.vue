<script setup>
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

onMounted(() => {
  useHead({ title: t('title') })

  window.location = `${runtimeConfig.public.apiUrl}/auth/google?next=${window.location.origin}/auth/callback?key=`
})
</script>

<template>
  <div />
</template>

<i18n lang="yaml">
  en:
    title: Sign In
  et:
    title: Sisene
</i18n>
