<script setup>
const route = useRoute()
const { t } = useI18n()
const { setToken, user } = useUser()
const { accounts } = useAccount()

definePageMeta({ layout: 'spinner' })

onMounted(async () => {
  useHead({ title: t('title') })

  const nextPage = useLocalStorage('next', { path: '/' })
  const invite = route.query.invite
  const inviteDb = invite ? JSON.parse(atob(invite.split('.').at(1).replace(/-/g, '+').replace(/_/g, '/')))?.db : null
  const authAccount = inviteDb || nextPage.value?.path?.split('/').filter((x) => x !== 'new').at(1)
  let newUser = {}

  const authParams = authAccount ? { db: authAccount } : {}

  if (invite) {
    authParams.invite = invite
  }

  const authResponse = await apiRequest('auth', authParams, { Authorization: `Bearer ${route.query.key}` })

  if (authResponse.accounts?.length > 0) {
    accounts.value = authResponse.accounts

    newUser = authResponse.accounts.find((x) => x._id === authAccount)?.user || {}
  }
  else {
    accounts.value = []
  }

  setToken(authResponse)

  if (authResponse.user) {
    user.value = authResponse.user
  }

  const newDatabase = !invite && sessionStorage.getItem('new-database')

  if (newDatabase) {
    try {
      const db = await setupNewDatabase(authResponse.token, newDatabase)

      sessionStorage.removeItem('new-database')
      nextPage.value = {}

      await navigateTo(`/${db}`)
    }
    catch (e) {
      sessionStorage.setItem('new-database-error', e.data?.statusMessage || e.message)
      nextPage.value = {}

      await navigateTo('/new')
    }
  }
  else if (newUser.new) {
    await navigateTo({ path: `/${authAccount}/${newUser?._id}`, hash: 'edit' })
  }
  else if (!invite && nextPage.value.path !== '/') {
    const to = { path: nextPage.value?.path || '/', query: nextPage.value?.query }
    nextPage.value = {}

    await navigateTo(to)
  }
  else if (accounts.value.length > 0) {
    await navigateTo({ path: '/' })
  }
  else {
    await navigateTo({ path: '/new' })
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
