<script setup>
import { NSpin } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const { t } = useI18n()
const { checkSupport, hasError, isCancelled, isSupported, isWorking, register, signIn } = usePasskey()

const buttonGroups = computed(() => [[
  { id: 'create', icon: 'passkey', label: t('registerButton'), onClick: register }
]])

onMounted(async () => {
  useHead({ title: t('title') })

  // Only the API sends users here, with a login state - without one there is no login to complete
  if (!route.query.state) {
    await navigateTo({ path: '/' })

    return
  }

  // The user picks a new or an existing passkey here, so nothing starts before a click
  await checkSupport()
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

      <!-- The secondary choice, styled like the sign-in page's Create New Database -->
      <my-button
        block
        ghost
        icon="passkey"
        size="large"
        :label="t('existingButton')"
        @click="signIn"
      />

      <p
        v-if="hasError && !isCancelled"
        class="text-center text-sm text-red-800"
      >
        {{ t('error') }}
      </p>
    </template>
  </my-auth-layout>
</template>

<i18n lang="yaml">
  en:
    title: Continue with Passkey
    notSupported: Passkeys are not supported on this device
    description: Use your fingerprint, face recognition, or device PIN. No passwords needed.
    registerButton: Create a New Passkey
    existingButton: Use an Existing Passkey
    error: The passkey did not work. Please try again.
  et:
    title: Jätka pääsuvõtmega
    notSupported: Pääsuvõti ei ole sellel seadmel toetatud
    description: Kasuta sõrmejälge, näotuvastust või seadme PIN-koodi. Paroole pole vaja.
    registerButton: Loo uus pääsuvõti
    existingButton: Kasuta olemasolevat pääsuvõtit
    error: Pääsuvõti ei töötanud. Palun proovi uuesti.
</i18n>
