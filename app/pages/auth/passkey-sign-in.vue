<script setup>
import { NSpin, NCard } from 'naive-ui'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const { t } = useI18n()
const { checkSupport, hasError, isSupported, isWorking, signIn } = usePasskey()

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
            <div class="space-y-3">
              <p class="max-w-sm text-sm text-gray-700">
                {{ t('description') }}
              </p>

              <div
                v-if="hasError"
                class="space-y-2"
              >
                <p class="max-w-sm text-sm font-medium text-gray-700">
                  {{ t('errorTitle') }}
                </p>
                <ol class="max-w-sm list-inside list-decimal space-y-1 text-sm text-gray-600">
                  <li>{{ t('step1') }}</li>
                  <li>{{ t('step2') }}</li>
                  <li>{{ t('step3') }}</li>
                </ol>
              </div>
            </div>
          </n-card>

          <my-button
            block
            size="large"
            type="primary"
            :label="t('authenticateButton')"
            @click="signIn"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Sign in with Passkey
    notSupported: Passkeys are not supported on this device
    authenticateButton: Sign in with Passkey
    description: Passkeys let you sign in to Entu securely using your fingerprint, face recognition, or device PIN. No passwords needed - just use your device's built-in security.
    errorTitle: 'If you have not set up Passkey, then:'
    step1: Sign in using another authentication method
    step2: Open your person object (at the bottom of the left menu)
    step3: Edit the person object, choose Add Login Method, then Passkey and Create a New Passkey
  et:
    title: Logi sisse pääsuvõtmega
    notSupported: Pääsuvõti ei ole sellel seadmel toetatud
    authenticateButton: Logi sisse pääsuvõtmega
    description: Pääsuvõti võimaldab sul Entusse turvaliselt sisse logida sõrmejälje, näotuvastuse või seadme PIN-koodiga. Paroolid pole vajalikud - kasuta lihtsalt oma seadme sisseehitatud turvalisust.
    errorTitle: 'Kui sa ei ole pääsuvõtit seadistanud, siis:'
    step1: Logi sisse kasutades muud autentimismeetodit
    step2: Ava oma isikuobjekt (all vasakpoolses menüüs)
    step3: Muuda isikuobjekti, vali Lisa sisselogimisviis, seejärel Pääsuvõti ja Loo uus pääsuvõti
</i18n>
