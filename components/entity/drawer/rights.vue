<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButtonGroup } from 'naive-ui'

const { t } = useI18n()

const emit = defineEmits(['close'])

const entityId = defineModel('entityId', { type: String, required: true })

const rawEntity = ref()
const isLoading = ref(false)
const isUpdating = ref(false)

watch(entityId, loadEntity, { immediate: true })

const entityName = computed(() => getValue(rawEntity.value?.name))
const isPublic = computed(() => getValue(rawEntity.value?._public, 'boolean') || false)
const users = ref([])
const rights = ref([
  'viewer',
  'expander',
  'editor',
  'owner'
])

async function loadEntity () {
  isLoading.value = true

  if (entityId.value) {
    rawEntity.value = await apiGetEntity(entityId.value, [
      'name',
      '_viewer',
      '_expander',
      '_editor',
      '_owner',
      '_public'
    ])
  }

  users.value = cloneArray([
    ...rawEntity.value?._viewer?.map(x => ({ ...x, type: 'viewer' })) || [],
    ...rawEntity.value?._expander?.map(x => ({ ...x, type: 'expander' })) || [],
    ...rawEntity.value?._editor?.map(x => ({ ...x, type: 'editor' })) || [],
    ...rawEntity.value?._owner?.map(x => ({ ...x, type: 'owner' })) || []
  ].sort((a, b) => a.string?.localeCompare(b.string)))

  isLoading.value = false
}

function onUpdateRight (right) {
  console.log(right)
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
    :width="550"
    @close="onClose()"
  >
    <div
      v-for="user in users"
      :key="user._id"
      class="mb-4 flex items-center justify-between gap-2"
    >
      <div class="grow overflow-ellipsis">
        {{ user.string.trim() || user.reference }}
      </div>

      <n-button-group>
        <my-button
          v-for="r in rights"
          :key="r"
          :class="{ '!bg-blue-400 !text-white': user.type === r }"
          :icon="`rights/${r}`"
          :tooltip="t(`${r}Description`)"
          @click="user.type = r"
        />
      </n-button-group>

      <my-button
        circle
        icon="delete"
        type="error"
        :bg="false"
        :tooltip="t('delete')"
        @click="user.type = undefined"
      />
    </div>
  </my-drawer>
</template>

<i18n lang="yaml">
  en:
    title: Rights - {name}
    none: No rights
    viewer: Viewer
    viewerDescription: User can see this entity
    expander: Expander
    expanderDescription: User can add children to this entity
    editor: Editor
    editorDescription: User can edit this entity and add children to it
    owner: Owner
    ownerDescription: User can edit, delete, add children and change rights
    delete: Delete right from user
  et:
    title: Õigused - {name}
    none: Pole õigusi
    viewer: Vaataja
    viewerDescription: Kasutaja näeb seda objekti
    expander: Laiendaja
    expanderDescription: Kasutaja saab sellele objektile lisada alamobjekte
    editor: Toimetaja
    editorDescription: Kasutaja saab objekti muuta ja lisada sellele alamosi
    owner: Omanik
    ownerDescription: Kasutaja saab objekti muuta, kustutada, lisada sellele alamosi ja muuta õigusi
    delete: Kustuta kasutajalt õigus
</i18n>
