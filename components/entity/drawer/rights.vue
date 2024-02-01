<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButtonGroup, NDivider, NSwitch } from 'naive-ui'

const { t } = useI18n()
const { userId } = useUser()

const emit = defineEmits(['close'])

const entityId = defineModel('entityId', { type: String, required: true })

const rawEntity = ref()
const isPublic = ref(false)
const users = ref([])
const rights = ref([
  'viewer',
  'expander',
  'editor',
  'owner'
])
const isLoading = ref(false)
const isUpdating = ref(false)
const isUpdatingPublic = ref(false)

watch(entityId, loadEntity, { immediate: true })

const entityName = computed(() => getValue(rawEntity.value?.name))

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

  isPublic.value = getValue(rawEntity.value?._public, 'boolean') || false

  users.value = cloneArray([
    ...rawEntity.value?._viewer?.map(x => ({ ...x, type: 'viewer' })) || [],
    ...rawEntity.value?._expander?.map(x => ({ ...x, type: 'expander' })) || [],
    ...rawEntity.value?._editor?.map(x => ({ ...x, type: 'editor' })) || [],
    ...rawEntity.value?._owner?.map(x => ({ ...x, type: 'owner' })) || []
  ].sort((a, b) => a.string?.localeCompare(b.string)))

  isLoading.value = false
}

async function updateIsPublic (value) {
  isUpdatingPublic.value = true

  await apiUpsertEntity(
    entityId.value,
    getValue(rawEntity.value?._public, '_id'),
    value === true ? [{ type: '_public', boolean: value }] : undefined
  )

  isUpdatingPublic.value = false
}

async function onAddRight (reference) {
  isUpdating.value = true

  await apiUpsertEntity(
    entityId.value,
    undefined,
    [{ type: '_viewer', reference }]
  )

  await loadEntity()

  isUpdating.value = false
}

async function onEditRight (_id, reference, right) {
  isUpdating.value = true

  await apiUpsertEntity(
    entityId.value,
    _id,
    [{ type: `_${right}`, reference }]
  )

  await loadEntity()

  isUpdating.value = false
}

async function onDeleteRight (_id) {
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

function railStyle ({ focused, checked }) {
  const style = {}

  if (checked) {
    style.background = 'rgb(249, 115, 22)'

    if (focused) {
      style.boxShadow = '0 0 0 2px rgba(249, 115, 22, 0.4)'
    }
  } else {
    style.background = 'rgb(22, 163, 74)'

    if (focused) {
      style.boxShadow = '0 0 0 2px rgba(22, 163, 74, 0.4)'
    }
  }

  return style
}
</script>

<template>
  <my-drawer
    :is-loading="isLoading || isUpdating"
    :title="t('title', { name: entityName })"
    :width="550"
    @close="onClose()"
  >
    <div class="w-full mt-12 flex flex-col justify-center items-center gap-4">
      <n-switch
        v-model:value="isPublic"
        size="large"
        :loading="isUpdatingPublic"
        :rail-style="railStyle"
        @update:value="updateIsPublic($event)"
      >
        <template #unchecked-icon>
          <my-icon
            class="text-green-600"
            icon="public/false"
          />
        </template>
        <template #unchecked>
          {{ t('isNotPublic') }}
        </template>

        <template #checked-icon>
          <my-icon
            class="text-orange-500"
            icon="public/true"
          />
        </template>
        <template #checked>
          {{ t('isPublic') }}
        </template>
      </n-switch>

      <div class="max-w-80 text-center text-sm text-gray-500">
        {{ isPublic === true ? t('isPublicDescription') : t('isNotPublicDescription') }}
      </div>
    </div>

    <n-divider class="!mt-16 !text-gray-500">
      {{ t('userRights') }}
    </n-divider>

    <div
      v-for="user in users"
      :key="user._id"
      class="mb-4 flex items-center justify-between gap-2"
    >
      <div
        class="grow truncate whitespace-nowrap overflow-hidden"
        :class="{ 'text-gray-400': user.reference === userId }"
      >
        {{ user.string?.trim() || user.reference }}
      </div>

      <n-button-group>
        <my-button
          v-for="r in rights"
          :key="r"
          :class="{ '!bg-blue-400 !text-white': user.type === r }"
          :disabled="user.reference === userId"
          :icon="`rights/${r}`"
          :tooltip="t(`${r}Description`)"
          @click="onEditRight(user._id, user.reference, r)"
        />
      </n-button-group>

      <my-button
        circle
        icon="delete"
        type="error"
        :bg="false"
        :disabled="user.reference === userId"
        :tooltip="t('delete')"
        @click="onDeleteRight(user._id)"
      />
    </div>

    <my-select-reference
      class="mt-6"
      query="_type.string=person"
      :placeholder="t('selectNewUser')"
      @update:value="onAddRight($event)"
    />
  </my-drawer>
</template>

<i18n lang="yaml">
  en:
    title: Rights - {name}
    isPublic: Entity is Public
    isPublicDescription: Anyone on the Internet can view the public parameters of this entity. No login required.
    isNotPublic: Entity is not Public
    isNotPublicDescription: Only authorized users (below) can view this entity. Login is required.
    userRights: Users rights
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
    selectNewUser: Add new user
    searchUser: Search user
  et:
    title: Õigused - {name}
    isPublic: Objekt on avalik
    isPublicDescription: Igaüks Internetis saab vaadata selle objekti avalikke parameetreid. Sisselogimine pole vajalik.
    isNotPublic: Objekt ei ole avalik
    isNotPublicDescription: Seda objekti saavad vaadata ainult volitatud kasutajad. Sisselogimine on vajalik.
    userRights: Kasutajate õigused
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
    selectNewUser: Lisa uus kasutaja
    searchUser: Otsi kasutajat
</i18n>
