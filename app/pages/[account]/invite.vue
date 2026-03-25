<script setup>
import { NCard } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })

const token = route.query.token
const db = route.params.account

const authProviders = [
  { value: 'e-mail', icon: 'e-mail' },
  { value: 'google', icon: 'google' },
  { value: 'apple', icon: 'apple' },
  { value: 'smart-id', icon: 'smart-id' },
  { value: 'mobile-id', icon: 'mobile-id' },
  { value: 'id-card', icon: 'id-card' }
]

function setLanguage () {
  setLocale(locale.value === 'en' ? 'et' : 'en')
  reloadNuxtApp()
}

onMounted(async () => {
  useHead({ title: t('title', { db }) })

  if (!token) {
    await navigateTo('/')
  }
})
</script>

<template>
  <div class="flex size-full flex-col overflow-auto bg-gray-50">
    <div class="my-8 flex w-full grow flex-col gap-8 px-4 sm:mx-auto sm:w-96">
      <div class="-mb-6">
        <span
          class="float-right cursor-pointer text-xs font-bold uppercase text-gray-500"
          @click="setLanguage()"
        >
          {{ t('language') }}
        </span>
      </div>

      <a href="/">
        <img
          class="mx-auto size-24"
          src="/logo.png"
        >
      </a>

      <n-card :title="t('title', { db })">
        <nuxt-link
          v-for="provider in authProviders"
          :key="provider.value"
          :to="{ path: `/auth/${provider.value}`, query: { invite: token } }"
          class="flex items-center gap-2 border-b py-2 last-of-type:border-b-0"
        >
          <my-icon :icon="provider.icon" />
          {{ t(`auth-${provider.value}`) }}
        </nuxt-link>

        <template #footer>
          <p class="mt-1 text-sm text-gray-500">
            {{ t('description') }}
          </p>
        </template>
      </n-card>
    </div>
    <div class="mb-2 px-4 text-center text-sm text-gray-500">
      <a
        target="_blank"
        :href="t('docsUrl')"
      >{{ t('docs') }}</a>

      <span class="mx-2">&middot;</span>

      <a
        target="_blank"
        :href="t('pricingUrl')"
      >{{ t('pricing') }}</a>

      <span class="mx-2">&middot;</span>

      <a
        target="_blank"
        :href="t('termsUrl')"
      >{{ t('terms') }}</a>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    language: Eesti keel
    title: You have been invited to join Entu database {db}
    description: Sign in with one of the options above to accept your invitation.
    auth-e-mail: E-mail
    auth-google: Google
    auth-apple: Apple
    auth-smart-id: Smart-ID
    auth-mobile-id: Mobile-ID
    auth-id-card: ID-Card
    terms: Terms of Service
    termsUrl: https://entu.ee/terms/
    pricing: Pricing
    pricingUrl: https://entu.ee/#pricing
    docs: Documentation
    docsUrl: https://entu.ee/overview/
  et:
    language: English
    title: Sind on kutsutud liituma Entu andmebaasiga {db}
    description: Kutse vastuvõtmiseks logi sisse ülaltoodud valikuga.
    auth-e-mail: E-post
    auth-google: Google
    auth-apple: Apple
    auth-smart-id: Smart-ID
    auth-mobile-id: Mobiil-ID
    auth-id-card: ID-kaart
    terms: Kasutustingimused
    termsUrl: https://entu.ee/et/terms/
    pricing: Hinnad
    pricingUrl: https://entu.ee/et/#hinnad
    docs: Dokumentatsioon
    docsUrl: https://entu.ee/et/overview/
</i18n>
