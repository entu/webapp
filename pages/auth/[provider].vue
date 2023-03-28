<script setup>
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const route = useRoute()
const location = useBrowserLocation()

onMounted(async () => {
  useHead({ title: t('title') })

  await navigateTo(`${runtimeConfig.public.apiUrl}/auth/${route.params.provider}?next=${location.value.origin}/auth/callback?key=`, { external: true })
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
