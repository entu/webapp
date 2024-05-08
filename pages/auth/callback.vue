<script setup>
import { NSpin } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()
const { token, user } = useUser()
const { accounts } = useAccount()

definePageMeta({ layout: 'blank' })

onMounted(async () => {
  useHead({ title: t('title') })

  const nextPage = useLocalStorage('next', { path: '/' })
  const authAccount = nextPage.value?.path.split('/').filter(x => x !== 'new').at(1)
  let newUser = {}

  const authResponse = await apiRequest('auth', authAccount ? { account: authAccount } : {}, { Authorization: `Bearer ${route.query.key}` })

  if (authResponse.accounts?.length > 0) {
    accounts.value = authResponse.accounts

    newUser = authResponse.accounts.find(x => x._id === authAccount)?.user || {}
  } else {
    accounts.value = []
  }

  if (authResponse.token) {
    token.value = authResponse.token
  } else {
    token.value = undefined
  }

  if (authResponse.user) {
    user.value = authResponse.user
  }

  if (newUser.new) {
    await navigateTo({ path: `/${authAccount}/${newUser?._id}`, hash: 'edit' })
  } else if (nextPage.value.path !== '/') {
    const to = { path: nextPage.value?.path || '/', query: nextPage.value?.query }
    nextPage.value = {}

    await navigateTo(to)
  } else if (accounts.value.length > 0) {
    await navigateTo({ path: `/${accounts.value.at(0)._id}` })
  } else {
    await navigateTo({ path: '/new' })
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
