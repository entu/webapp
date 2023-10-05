<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const props = defineProps({
  entityId: { type: String, required: true }
})

const emit = defineEmits(['update:title'])

const { t } = useI18n()

onMounted(() => {
  emit('update:title', t('title'))
})
</script>

<template>
  <pre class="text-xs">{{ entityId }}</pre>
</template>

<i18n lang="yaml">
  en:
    title: Parents
  et:
    title: Kuuluvus
</i18n>
