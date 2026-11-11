<script setup>
definePageMeta({ layout: 'blank' })

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t, locale } = useI18n()

// Only the API sends users here, with an OAuth authorization request it already checked; a custom-scheme redirect has no host, so its scheme names the app
const host = computed(() => {
  if (!URL.canParse(route.query.redirect_uri)) return

  const url = new URL(route.query.redirect_uri)

  return url.host || url.protocol
})

const buttonGroups = computed(() => authProviderGroups().map((group) => group.map((provider) => ({
  id: provider.id,
  icon: provider.icon,
  label: t(provider.label),
  onClick: () => signIn(provider)
}))))

onMounted(async () => {
  useHead({ title: t('title') })

  // A sign-in in a frame could be overlaid to trick clicks, so it only runs as a top-level page
  if (!route.query.client_id || !host.value || window.top !== window.self) {
    await navigateTo({ path: '/' })
  }
})

// Back to the authorization endpoint with the same request and the chosen provider
async function signIn (provider) {
  const query = new URLSearchParams(Object.entries(route.query).filter(([, value]) => typeof value === 'string'))

  query.set('provider', provider.path)
  query.set('lang', locale.value)

  await navigateTo(`${runtimeConfig.public.apiUrl.replace(/\/$/, '')}/auth/authorize?${query}`, { external: true })
}
</script>

<template>
  <my-auth-layout
    :description="t('description', { host })"
    :title="t('title')"
  >
    <my-auth-buttons :groups="buttonGroups" />
  </my-auth-layout>
</template>

<i18n lang="yaml">
  en:
    title: Sign In
    description: 'Sign in to connect {host} to Entu.'
  et:
    title: Sisene
    description: 'Logi sisse, et ühendada {host} Entuga.'
</i18n>
