<script setup>
import { NSpin } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()
const { token } = useUser()
const { accounts } = useAccount()

onMounted(async () => {
  useHead({ title: t('title') })

  const authResponse = await apiRequest('auth', {}, { Authorization: `Bearer ${route.query.key}` })

  if (authResponse.accounts) {
    accounts.value = authResponse.accounts
  }

  if (authResponse.token) {
    token.value = authResponse.token
  } else {
    token.value = undefined
  }

  const nextPage = useLocalStorage('next', { path: '/' })

  if (nextPage.value.path !== '/') {
    const to = { path: nextPage.value?.path || '/', query: nextPage.value?.query }
    nextPage.value = {}

    await navigateTo(to)
  } else if (accounts.value.length > 0) {
    await navigateTo({ path: `/${accounts.value.at(0)._id}` })
  }
})
</script>

<template>
  <n-spin
    class="size-full"
    :show="true"
    :delay="1000"
  />
</template>

<i18n lang="yaml">
  en:
    title: Sign In
  et:
    title: Sisene
</i18n>
