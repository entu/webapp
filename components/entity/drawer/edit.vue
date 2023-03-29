<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const props = defineProps({
  entityId: { type: String, default: null },
  parentId: { type: String, default: null },
  typeId: { type: String, default: null }
})

const emit = defineEmits(['update:title'])

const { t } = useI18n()

onMounted(() => {
  if (props.parentId && props.typeId) emit('update:title', t('titleChild'))
  if (!props.parentId && props.typeId) emit('update:title', t('titleAdd'))
  if (!props.parentId && props.entityId) emit('update:title', t('titleEdit'))
})
</script>

<template>
  <pre>{{ props }}</pre>
</template>

<i18n lang="yaml">
  en:
    titleAdd: Add
    titleChild: Add Child
    titleEdit: Edit
  et:
    titleAdd: Lisa
    titleChild: Lisa alamobjekt
    titleEdit: Muuda
</i18n>
