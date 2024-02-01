<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NEmpty } from 'naive-ui'

const { t } = useI18n()
const { accountId } = useAccount()

const emit = defineEmits(['close'])

const entityId = defineModel('entityId', { type: String, required: true })

const rawEntity = ref()
const isLoading = ref(false)
const isUpdating = ref(false)

watch(entityId, loadEntity, { immediate: true })

const entityName = computed(() => getValue(rawEntity.value?.name))
const parents = computed(() => rawEntity.value?._parent?.sort((a, b) => a.string.localeCompare(b.string)) || [])

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

async function onAddParent (reference) {
  isUpdating.value = true

  await apiUpsertEntity(
    entityId.value,
    undefined,
    [{ type: '_parent', reference }]
  )

  await loadEntity()

  isUpdating.value = false
}

async function onDeleteParent (_id) {
  isUpdating.value = true

  await apiUpsertEntity(
    entityId.value,
    _id
  )

  await loadEntity()

  isUpdating.value = false
}

async function onClose () {
  await until(isUpdating).not.toBeTruthy()

  emit('close')
}
</script>

<template>
  <my-drawer
    :is-loading="isLoading || isUpdating"
    :title="t('title', { name: entityName })"
    :width="500"
    @close="onClose()"
  >
    <div
      v-for="parent in parents"
      :key="parent._id"
      class="mb-2 flex items-center justify-between gap-2"
    >
      <nuxt-link
        class="link grow truncate whitespace-nowrap overflow-hidden"
        :to="{ path: `/${accountId}/${parent.reference}` }"
      >
        {{ parent.string || parent.reference }}
      </nuxt-link>

      <my-button
        circle
        icon="delete"
        type="error"
        :bg="false"
        :tooltip="t('delete')"
        @click="onDeleteParent(parent._id)"
      />
    </div>

    <n-empty
      v-if="parents.length === 0"
      :description="t('noParents')"
    />

    <my-select-reference
      class="mt-6"
      :placeholder="t('selectNewParent')"
      @update:value="onAddParent($event)"
    />
  </my-drawer>
</template>

<i18n lang="yaml">
  en:
    title: Parents - {name}
    noParents: This entity has no parents
    delete: Delete parent
    selectNewParent: Select new parent
  et:
    title: Kuuluvus - {name}
    noParents: See objekt ei kuulu ühegi objekti alla
    delete: Kustuta kuuluvus
    selectNewParent: Vali uus kuuluvus
</i18n>
