<script setup>
import { NSpin } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()
const { accounts } = useAccount()

onMounted(async () => {
  useHead({ title: t('title') })

  const authResponse = await apiGet('auth', { account: '' }, { Authorization: `Bearer ${route.query.key}` })

  if (Array.isArray(authResponse) && authResponse.length > 0) {
    accounts.value = authResponse
    await navigateTo({ path: `/${authResponse.at(0).account}`, query: {} })
  } else {
    accounts.value = []
    await navigateTo({ path: '/', query: {} })
  }
})
</script>

<template>
  <n-spin
    class="h-full w-full"
    :show="isLoading"
    :delay="1000"
  />
</template>

<i18n lang="yaml">
  en:
    title: Sign In
  et:
    title: Sisene
</i18n>
