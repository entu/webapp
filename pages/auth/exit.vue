<script setup>
const { t } = useI18n()
const { accounts } = useAccount()
const { token } = useUser()

onMounted(async () => {
  useHead({ title: t('title') })

  let path = '/'

  if (accounts.value.length === 1) {
    path = `/${accounts.value.at(0)._id}`
  }

  accounts.value = undefined
  token.value = undefined

  await navigateTo({ path, query: {} })
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
