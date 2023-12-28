<script setup>
import { NSpin } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()
const { accounts } = useAccount()

onMounted(async () => {
  useHead({ title: t('title') })

  const authResponse = await apiRequest('auth', { account: '' }, { Authorization: `Bearer ${route.query.key}` })
  const nextPage = useLocalStorage('next', {})
  const to = { path: nextPage.value?.path || '/', query: nextPage.value?.query }

  if (Array.isArray(authResponse) && authResponse.length > 0) {
    accounts.value = authResponse
  } else {
    accounts.value = []
  }

  nextPage.value = {}

  await navigateTo(to)
})
</script>

<template>
  <n-spin
    class="size-full"
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
