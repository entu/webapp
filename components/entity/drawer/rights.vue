<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NCheckbox, NDivider, NSwitch } from 'naive-ui'

const { t } = useI18n()
const { accountId } = useAccount()
const { userId } = useUser()

const emit = defineEmits(['close'])

const entityId = defineModel('entityId', { type: String, required: true })

const rawEntity = ref()
const isPublic = ref(false)
const users = ref([])
const isLoading = ref(false)
const isUpdating = ref(false)
const isUpdatingPublic = ref(false)
const inheritRights = ref(false)

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
      '_public',
      '_inheritrights'
    ])
  }

  isPublic.value = getValue(rawEntity.value?._public, 'boolean') || false
  inheritRights.value = getValue(rawEntity.value?._inheritrights, 'boolean') || false

  const owners = rawEntity.value?._owner?.map(x => x.reference) || []
  const editors = rawEntity.value?._editor?.map(x => x.reference).filter(x => !owners.includes(x)) || []
  const expanders = rawEntity.value?._expander?.map(x => x.reference).filter(x => !owners.includes(x) && !editors.includes(x)) || []
  const viewers = rawEntity.value?._viewer?.map(x => x.reference).filter(x => !owners.includes(x) && !editors.includes(x) && !expanders.includes(x)) || []

  users.value = cloneArray([
    ...rawEntity.value?._viewer?.filter(x => viewers.includes(x.reference)).map(x => ({ ...x, type: 'viewer' })) || [],
    ...rawEntity.value?._expander?.filter(x => expanders.includes(x.reference)).map(x => ({ ...x, type: 'expander' })) || [],
    ...rawEntity.value?._editor?.filter(x => editors.includes(x.reference)).map(x => ({ ...x, type: 'editor' })) || [],
    ...rawEntity.value?._owner?.filter(x => owners.includes(x.reference)).map(x => ({ ...x, type: 'owner' })) || []
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

async function updateInheritRights (value) {
  isUpdating.value = true

  await apiUpsertEntity(
    entityId.value,
    getValue(rawEntity.value?._inheritrights, '_id'),
    value === true ? [{ type: '_inheritrights', boolean: value }] : undefined
  )

  isUpdating.value = false
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
    right ? [{ type: `_${right}`, reference }] : undefined
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
    <div class="flex flex-col gap-12">
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

      <div>
        <n-divider class="!text-gray-500">
          {{ t('userRightsParent') }}
        </n-divider>

        <template v-if="inheritRights">
          <my-rights-switch
            v-for="user in users"
            :key="user._id"
            v-model="user.type"
            class="mb-4 flex items-center justify-between gap-2"
            disabled
            :label="user.string?.trim() || user.reference"
            :to="{ path: `/${accountId}/${user.reference}` }"
          />
        </template>

        <div class="mt-6 flex items-center justify-center gap-2">
          <n-checkbox
            v-model:checked="inheritRights"
            size="large"
            @update:checked="updateInheritRights($event)"
          >
            {{ t('inheritRights') }}
          </n-checkbox>
        </div>
      </div>

      <div>
        <n-divider class="!text-gray-500">
          {{ t('userRightsEntity') }}
        </n-divider>

        <my-rights-switch
          v-for="user in users"
          :key="user._id"
          v-model="user.type"
          class="mb-4 flex items-center justify-between gap-2"
          deletable
          :disabled="user.reference === userId"
          :label="user.string?.trim() || user.reference"
          :to="{ path: `/${accountId}/${user.reference}` }"
          @update:value="onEditRight(user._id, user.reference, $event)"
        />

        <my-select-reference
          class="mt-6"
          query="_type.string=person"
          :placeholder="t('selectNewUser')"
          @update:value="onAddRight($event)"
        />
      </div>
    </div>
  </my-drawer>
</template>

<i18n lang="yaml">
  en:
    title: Rights - {name}
    isPublic: Entity is Public
    isPublicDescription: Anyone on the Internet can view the public parameters of this entity. No login required.
    isNotPublic: Entity is not Public
    isNotPublicDescription: Only authorized users (below) can view this entity. Login is required.
    inheritRights: Inherit rights from parent
    userRightsParent: Parent entity rights
    userRightsEntity: Entity specific rights
    selectNewUser: Add new user
  et:
    title: Õigused - {name}
    isPublic: Objekt on avalik
    isPublicDescription: Igaüks Internetis saab vaadata selle objekti avalikke parameetreid. Sisselogimine pole vajalik.
    isNotPublic: Objekt ei ole avalik
    isNotPublicDescription: Seda objekti saavad vaadata ainult õigustega kasutajad. Sisselogimine on vajalik.
    inheritRights: Päri õigused peamiselt objektilt
    userRightsParent: Peamise objekti õigused
    userRightsEntity: Objekti spetsiifilised õigused
    selectNewUser: Lisa uus kasutaja
</i18n>
