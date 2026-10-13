<script setup>
import { NSpin } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const { t } = useI18n()
const { checkSupport, hasError, isSupported, isWorking, signIn } = usePasskey()

const buttonGroups = computed(() => [[
  { id: 'sign-in', icon: 'passkey', label: t('authenticateButton'), onClick: signIn }
]])

onMounted(async () => {
  useHead({ title: t('title') })

  // Only the API sends users here, with a login state - without one there is no login to complete
  if (!route.query.state) {
    await navigateTo({ path: '/' })

    return
  }

  // The user already chose a passkey, so the prompt opens without another click where the browser allows it
  if (await checkSupport()) {
    await signIn()
  }
})
</script>

<template>
  <my-auth-layout
    :description="t('description')"
    :title="t('title')"
  >
    <div
      v-if="isWorking"
      class="flex justify-center py-4"
    >
      <n-spin />
    </div>

    <p
      v-else-if="!isSupported"
      class="text-center text-sm text-red-800"
    >
      {{ t('notSupported') }}
    </p>

    <template v-else>
      <my-auth-buttons :groups="buttonGroups" />

      <div
        v-if="hasError"
        class="flex flex-col gap-2 text-sm text-slate-500"
      >
        <p class="font-medium">
          {{ t('errorTitle') }}
        </p>
        <ol class="list-inside list-decimal space-y-1">
          <li>{{ t('step1') }}</li>
          <li>{{ t('step2') }}</li>
          <li>{{ t('step3') }}</li>
        </ol>
      </div>
    </template>
  </my-auth-layout>
</template>

<i18n lang="yaml">
  en:
    title: Sign in with Passkey
    notSupported: Passkeys are not supported on this device
    authenticateButton: Sign in with Passkey
    description: Use your fingerprint, face recognition, or device PIN. No passwords needed.
    errorTitle: 'If you have not set up Passkey, then:'
    step1: Sign in using another authentication method
    step2: Open your person object (at the bottom of the left menu)
    step3: Edit the person object, choose Add Login Method, then Passkey and Create a New Passkey
  et:
    title: Logi sisse pääsuvõtmega
    notSupported: Pääsuvõti ei ole sellel seadmel toetatud
    authenticateButton: Logi sisse pääsuvõtmega
    description: Kasuta sõrmejälge, näotuvastust või seadme PIN-koodi. Paroole pole vaja.
    errorTitle: 'Kui sa ei ole pääsuvõtit seadistanud, siis:'
    step1: Logi sisse kasutades muud autentimismeetodit
    step2: Ava oma isikuobjekt (all vasakpoolses menüüs)
    step3: Muuda isikuobjekti, vali Lisa sisselogimisviis, seejärel Pääsuvõti ja Loo uus pääsuvõti
</i18n>
