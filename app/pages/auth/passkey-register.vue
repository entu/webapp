<script setup>
import { NSpin, NCard } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const { t } = useI18n()
const { checkSupport, hasError, isSupported, isWorking, register } = usePasskey()

onMounted(async () => {
  useHead({ title: t('title') })

  // Only the API sends users here, with a login state - without one there is no login to complete
  if (!route.query.state) {
    await navigateTo({ path: '/' })

    return
  }

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

          <div class="space-y-4 text-center">
            <my-button
              block
              size="large"
              type="primary"
              :label="t('registerButton')"
              @click="register"
            />

            <p
              v-if="hasError"
              class="text-sm text-red-800"
            >
              {{ t('registerError') }}
            </p>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Create a Passkey
    notSupported: Passkeys are not supported on this device
    description: Passkeys let you sign in to Entu securely using your fingerprint, face recognition, or device PIN. No passwords needed - just use your device's built-in security.
    registerButton: Create Passkey
    registerError: Creating the passkey failed. Please try again.
  et:
    title: Loo pääsuvõti
    notSupported: Pääsuvõti ei ole sellel seadmel toetatud
    description: Pääsuvõti võimaldab sul Entusse turvaliselt sisse logida sõrmejälje, näotuvastuse või seadme PIN-koodiga. Paroolid pole vajalikud - kasuta lihtsalt oma seadme sisseehitatud turvalisust.
    registerButton: Loo pääsuvõti
    registerError: Pääsuvõtme loomine ebaõnnestus. Palun proovi uuesti.
</i18n>
