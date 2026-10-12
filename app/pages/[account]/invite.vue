<script setup>
definePageMeta({ layout: 'blank' })

const route = useRoute()
const { t } = useI18n()

const token = route.query.token
const db = route.params.account

// The passkey page offers a new passkey first, and an existing one for a person who already has an Entu passkey
const providerGroups = authProviderGroups('create')

function providerRoute (provider) {
  return { path: `/auth/${provider.path}`, query: { invite: token } }
}

onMounted(async () => {
  useHead({ title: t('title', { db }) })

  if (!token) {
    await navigateTo('/')
  }
})
</script>

<template>
  <my-sign-in
    :description="t('description')"
    :provider-groups="providerGroups"
    :provider-route="providerRoute"
    :title="t('title', { db })"
  />
</template>

<i18n lang="yaml">
  en:
    title: You have been invited to join Entu database {db}
    description: Choose how you want to sign in to accept your invitation.
  et:
    title: Sind on kutsutud liituma Entu andmebaasiga {db}
    description: Kutse vastuvõtmiseks vali, kuidas soovid sisse logida.
</i18n>
