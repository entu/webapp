<script setup>
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const route = useRoute()

onMounted(() => {
  useHead({ title: t('title') })

  window.location = `${runtimeConfig.public.apiUrl}/auth/${route.params.provider}?next=${window.location.origin}/auth/callback?key=`
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
