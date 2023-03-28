<script setup>
const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()

const { accounts } = storeToRefs(userStore)

onMounted(async () => {
  useHead({ title: t('title') })

  await userStore.getAccounts(route.query.key)

  if (accounts.value.length > 0) {
    await navigateTo({ path: `/${accounts.value[0].account}`, query: {} })
  } else {
    await navigateTo({ path: '/', query: {} })
  }
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
