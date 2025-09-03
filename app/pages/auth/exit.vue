<script setup>
import { NSpin } from 'naive-ui'

const { t } = useI18n()
const { accounts } = useAccount()
const { logOut } = useUser()

onMounted(async () => {
  useHead({ title: t('title') })

  let path = '/'

  if (accounts.value.length === 1) {
    path = `/${accounts.value.at(0)._id}`
  }

  logOut()

  await navigateTo({ path, query: {} })
})
</script>

<template>
  <n-spin
    class="size-full"
    show
    :delay="1000"
  />
</template>

<i18n lang="yaml">
  en:
    title: Exit
  et:
    title: Välju
</i18n>
