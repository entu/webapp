<script setup>
import { NCard } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })

const token = route.query.token
const db = route.params.account

// The invited person may already have a passkey elsewhere in Entu, or create one now
const providerGroups = authProviderGroups(['use', 'create'])

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
  <div class="flex min-h-full flex-col">
    <div class="my-8 flex w-full grow flex-col gap-8 px-4 sm:mx-auto sm:w-96">
      <div class="-mb-6">
        <span
          class="float-right cursor-pointer text-xs font-bold text-gray-500 uppercase"
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
        <div class="flex flex-col gap-6">
          <div
            v-for="(group, index) in providerGroups"
            :key="index"
          >
            <nuxt-link
              v-for="provider in group"
              :key="provider.id"
              class="flex items-center gap-2 border-b py-2 last-of-type:border-b-0"
              :to="{ path: `/auth/${provider.path}`, query: { invite: token } }"
            >
              <my-icon :icon="provider.icon" />
              {{ t(provider.label) }}
            </nuxt-link>
          </div>
        </div>

        <template #footer>
          <p class="mt-1 text-sm text-gray-500">
            {{ t('description') }}
          </p>
        </template>
      </n-card>
    </div>
    <my-footer class="mb-2" />
  </div>
</template>

<i18n lang="yaml">
  en:
    language: Eesti keel
    title: You have been invited to join Entu database {db}
    description: Sign in with one of the options above to accept your invitation.
  et:
    language: English
    title: Sind on kutsutud liituma Entu andmebaasiga {db}
    description: Kutse vastuvõtmiseks logi sisse ülaltoodud valikuga.
</i18n>
