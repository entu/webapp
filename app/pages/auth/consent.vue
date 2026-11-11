<script setup>
import { NCheckbox } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()

const consent = ref()
const picked = ref([])
const hasError = ref(false)
const isWorking = ref(false)

const apiUrl = computed(() => `${runtimeConfig.public.apiUrl.replace(/\/$/, '')}/auth/consent`)

onMounted(async () => {
  useHead({ title: t('title') })

  // A page in a frame could be overlaid to trick the Allow click, and the webapp sends no frame-blocking headers
  if (window.top !== window.self) {
    hasError.value = true

    return
  }

  // Only the API sends users here, after every sign-in for an OAuth client
  if (!route.query.consent) {
    await navigateTo({ path: '/' })

    return
  }

  try {
    consent.value = await $fetch(apiUrl.value, { query: { consent: route.query.consent } })
  }
  catch {
    hasError.value = true

    return
  }

  // A single database is the obvious choice; with several the user picks on purpose
  if (consent.value.accounts.length === 1) {
    picked.value = [consent.value.accounts.at(0)._id]
  }
})

function toggle (account) {
  picked.value = picked.value.includes(account)
    ? picked.value.filter((x) => x !== account)
    : [...picked.value, account]
}

// Sends the choice to the API, which answers with where the OAuth client expects the browser - with a code, or with access denied
async function decide (accounts) {
  isWorking.value = true

  try {
    const { redirect } = await $fetch(apiUrl.value, { method: 'POST', body: { consent: route.query.consent, accounts } })

    await navigateTo(redirect, { external: true })
  }
  catch {
    hasError.value = true
    isWorking.value = false
  }
}
</script>

<template>
  <my-auth-layout
    v-if="hasError"
    :description="t('errorDescription')"
    :title="t('errorTitle')"
  >
    <my-button
      block
      size="large"
      type="primary"
      :label="t('home')"
      @click="navigateTo('/')"
    />
  </my-auth-layout>

  <my-auth-layout
    v-else-if="consent"
    :description="consent.client ? t('descriptionNamed', { client: consent.client, host: consent.host }) : t('description', { host: consent.host })"
    :title="t('title')"
  >
    <div
      v-if="consent.accounts.length > 0"
      class="flex flex-col gap-3"
    >
      <n-checkbox
        v-for="account in consent.accounts"
        :key="account._id"
        :checked="picked.includes(account._id)"
        :disabled="isWorking"
        @update:checked="() => toggle(account._id)"
      >
        <span class="font-medium">{{ account._id }}</span>
        <span
          v-if="account.user"
          class="text-slate-600 dark:text-slate-300"
        > · {{ account.user.name }}</span>
      </n-checkbox>
    </div>

    <p
      v-else
      class="text-center text-sm text-slate-600 dark:text-slate-300"
    >
      {{ t('noDatabases') }}
    </p>

    <div class="flex flex-col gap-2">
      <my-button
        block
        size="large"
        type="primary"
        :disabled="picked.length === 0 || isWorking"
        :label="t('allow')"
        @click="decide(picked)"
      />
      <my-button
        block
        size="large"
        :bg="false"
        :disabled="isWorking"
        :label="t('deny')"
        @click="decide([])"
      />
    </div>
  </my-auth-layout>

  <div
    v-else
    class="flex size-full items-center justify-center"
  >
    <my-spinner />
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Share Databases
    description: '{host} wants to read and change the databases you pick, with your rights.'
    descriptionNamed: '{host}, calling itself {client}, wants to read and change the databases you pick, with your rights.'
    noDatabases: You are not a user in any database, so there is nothing to share.
    allow: Allow
    deny: Deny
    errorTitle: Connecting failed
    errorDescription: This request is invalid or has expired. Start connecting again from the app.
    home: Go to Entu
  et:
    title: Jaga andmebaase
    description: '{host} soovib sinu õigustega lugeda ja muuta sinu valitud andmebaase.'
    descriptionNamed: '{host}, mis nimetab end {client}, soovib sinu õigustega lugeda ja muuta sinu valitud andmebaase.'
    noDatabases: Sa ei ole üheski andmebaasis kasutaja, seega pole midagi jagada.
    allow: Luba
    deny: Keela
    errorTitle: Ühendamine ebaõnnestus
    errorDescription: See päring on vigane või aegunud. Alusta ühendamist rakendusest uuesti.
    home: Ava Entu
</i18n>
