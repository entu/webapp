<script setup>
import { NButton, NCard } from 'naive-ui'

const { t } = useI18n()

// TODO: replace placeholder App Store URL once the Entu iOS app is published
const appStoreUrl = 'https://apps.apple.com/app/entu/id0'

definePageMeta({ layout: 'blank' })

onMounted(() => {
  useHead({ title: t('authAppCallback.title') })
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-white p-4">
    <div class="w-full max-w-fit space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ t('authAppCallback.title') }}
        </h1>
      </div>

      <n-card>
        <p class="max-w-sm text-sm text-gray-700">
          {{ t('authAppCallback.description') }}
        </p>
      </n-card>

      <n-button
        block
        rel="noopener noreferrer"
        size="large"
        tag="a"
        target="_blank"
        type="primary"
        :href="appStoreUrl"
      >
        {{ t('authAppCallback.downloadButton') }}
      </n-button>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    authAppCallback:
      title: Opening Entu…
      description: If the app didn't open, download Entu to continue signing in.
      downloadButton: Download on the App Store
  et:
    authAppCallback:
      title: Entu avamine…
      description: Kui rakendus ei avanenud, laadi Entu alla, et jätkata sisselogimist.
      downloadButton: Lae alla App Store'ist
</i18n>
