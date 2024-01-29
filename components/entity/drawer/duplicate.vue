<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const { t } = useI18n()

const emit = defineEmits(['close'])

const entityId = defineModel('entityId', { type: String, required: true })
</script>

<template>
  <drawer
    :title="t('title')"
    @close="emit('close')"
  >
    <pre class="text-xs">{{ entityId }}</pre>
  </drawer>
</template>

<i18n lang="yaml">
  en:
    title: Duplicate
  et:
    title: Dubleeri
</i18n>
