<script setup>
import { NSpin, NCard } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const { t } = useI18n()
const { checkSupport, hasError, isCancelled, isSupported, isWorking, register, signIn } = usePasskey()

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
  <div class="flex min-h-full items-center justify-center p-4">
    <div class="w-full max-w-fit space-y-6">
      <n-spin
        v-if="isWorking"
        class="size-full text-center"
        show
        :delay="1000"
      />

      <template v-else>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ t('title') }}
          </h1>
        </div>

        <p
          v-if="!isSupported"
          class="text-center text-red-800"
        >
          {{ t('notSupported') }}
        </p>

        <template v-else>
          <n-card>
            <p class="max-w-sm text-sm text-gray-700">
              {{ t('description') }}
            </p>
          </n-card>

          <div class="flex flex-col gap-4 text-center">
            <my-button
              block
              size="large"
              type="primary"
              :label="t('registerButton')"
              @click="register"
            />

            <my-button
              block
              ghost
              size="large"
              :label="t('existingButton')"
              @click="signIn"
            />

            <p
              v-if="hasError && !isCancelled"
              class="text-sm text-red-800"
            >
              {{ t('error') }}
            </p>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Continue with Passkey
    notSupported: Passkeys are not supported on this device
    description: Passkeys let you sign in to Entu securely using your fingerprint, face recognition, or device PIN. No passwords needed - just use your device's built-in security.
    registerButton: Create a New Passkey
    existingButton: Use an Existing Passkey
    error: The passkey did not work. Please try again.
  et:
    title: Jätka pääsuvõtmega
    notSupported: Pääsuvõti ei ole sellel seadmel toetatud
    description: Pääsuvõti võimaldab sul Entusse turvaliselt sisse logida sõrmejälje, näotuvastuse või seadme PIN-koodiga. Paroolid pole vajalikud - kasuta lihtsalt oma seadme sisseehitatud turvalisust.
    registerButton: Loo uus pääsuvõti
    existingButton: Kasuta olemasolevat pääsuvõtit
    error: Pääsuvõti ei töötanud. Palun proovi uuesti.
</i18n>
