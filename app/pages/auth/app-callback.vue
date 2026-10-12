<script setup>
const { t } = useI18n()

// TODO: replace placeholder App Store URL once the Entu iOS app is published
const appStoreUrl = 'https://apps.apple.com/app/entu/id0'

definePageMeta({ layout: 'blank' })

onMounted(() => {
  useHead({ title: t('authAppCallback.title') })
})
</script>

<template>
  <my-auth-layout
    :description="t('authAppCallback.description')"
    :title="t('authAppCallback.title')"
  >
    <my-button
      block
      rel="noopener noreferrer"
      size="large"
      tag="a"
      target="_blank"
      type="primary"
      :href="appStoreUrl"
      :label="t('authAppCallback.downloadButton')"
    />
  </my-auth-layout>
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
