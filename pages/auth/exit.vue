<script setup>
const { t } = useI18n()
const userStore = useUserStore()

onMounted(async () => {
  useHead({ title: t('title') })

  userStore.signOut()
  await navigateTo({ path: '/', query: {} })
})
</script>

<template>
  <div />
</template>

<i18n lang="yaml">
  en:
    title: Exit
  et:
    title: Välju
</i18n>
