<script setup>
import { NSpin } from 'naive-ui'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()

onMounted(async () => {
  useHead({ title: t('title') })

  useAnalytics(`auth_${route.params.provider}`)

  const callbackUrl = route.query.invite
    ? `${window.location.origin}/auth/callback?invite=${encodeURIComponent(route.query.invite)}&key=`
    : `${window.location.origin}/auth/callback?key=`

  await navigateTo(`${runtimeConfig.public.apiUrl.replace(/\/$/, '')}/auth/${route.params.provider}?next=${encodeURIComponent(callbackUrl)}`, { external: true })
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
    title: Sign In
  et:
    title: Sisene
</i18n>
