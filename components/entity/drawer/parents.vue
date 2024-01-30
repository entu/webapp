<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const { t } = useI18n()

const emit = defineEmits(['close'])

const entityId = defineModel('entityId', { type: String, required: true })

const rawEntity = ref()
const isLoading = ref(false)
const isUpdating = ref(false)

watch(entityId, loadEntity, { immediate: true })

const entityName = computed(() => getValue(rawEntity.value?.name))

async function loadEntity () {
  isLoading.value = true

  if (entityId.value) {
    rawEntity.value = await apiGetEntity(entityId.value, [
      'name',
      '_parent'
    ])
  }

  isLoading.value = false
}

async function onClose () {
  await until(isUpdating).not.toBeTruthy()

  emit('close')
}
</script>

<template>
  <drawer
    :resizable="false"
    :title="t('title', { name: entityName })"
    :width="500"
    @close="onClose()"
  >
    <pre class="text-xs">{{ rawEntity?._parent }}</pre>
  </drawer>
</template>

<i18n lang="yaml">
  en:
    title: Parents - {name}
  et:
    title: Kuuluvus - {name}
</i18n>
