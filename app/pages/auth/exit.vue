<script setup>
definePageMeta({ layout: 'spinner' })

const { t } = useI18n()
const { logOut } = useUser()

onMounted(() => {
  useHead({ title: t('title') })

  logOut()
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
