<script setup>
const { t } = useI18n()
</script>

<template>
  <div class="px-4 text-center text-sm text-gray-500">
    <change-log />

    <span class="mx-2">&middot;</span>

    <a
      rel="noopener noreferrer"
      target="_blank"
      :href="t('docsUrl')"
    >{{ t('docs') }}</a>

    <span class="mx-2">&middot;</span>

    <a
      rel="noopener noreferrer"
      target="_blank"
      :href="t('termsUrl')"
    >{{ t('terms') }}</a>
  </div>
</template>

<i18n lang="yaml">
  en:
    docs: Documentation
    docsUrl: https://entu.ee/overview/
    terms: Terms of Service
    termsUrl: https://entu.ee/terms/
  et:
    docs: Dokumentatsioon
    docsUrl: https://entu.ee/et/overview/
    terms: Kasutustingimused
    termsUrl: https://entu.ee/et/terms/
</i18n>
