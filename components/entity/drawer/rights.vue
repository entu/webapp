<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NCheckbox, NDivider, NRadio, NRadioGroup } from 'naive-ui'
import { apiDeleteProperty } from '~/utils/api'

const { t } = useI18n()
const { accountId } = useAccount()
const { userId } = useUser()

const emit = defineEmits(['close'])

const entityId = defineModel('entityId', { type: String, required: true })

const rawEntity = ref()
const newRight = ref()
const sharing = ref()
const isLoading = ref(false)
const isUpdating = ref(false)
const inheritRights = ref(false)

watch(entityId, loadEntity, { immediate: true })

const entityName = computed(() => getValue(rawEntity.value?.name))

const entityRights = computed(() => {
  const owners = rawEntity.value?._owner?.map(x => x._id) || []
  const editors = rawEntity.value?._editor?.map(x => x._id).filter(x => !owners.includes(x)) || []
  const expanders = rawEntity.value?._expander?.map(x => x._id).filter(x => !owners.includes(x) && !editors.includes(x)) || []
  const viewers = rawEntity.value?._viewer?.map(x => x._id).filter(x => !owners.includes(x) && !editors.includes(x) && !expanders.includes(x)) || []
  const noaccess = rawEntity.value?._noaccess?.map(x => x._id) || []

  return [
    ...rawEntity.value?._noaccess?.filter(x => noaccess.includes(x._id)).map(x => ({ ...x, type: 'noaccess' })) || [],
    ...rawEntity.value?._viewer?.filter(x => viewers.includes(x._id)).map(x => ({ ...x, type: 'viewer' })) || [],
    ...rawEntity.value?._expander?.filter(x => expanders.includes(x._id)).map(x => ({ ...x, type: 'expander' })) || [],
    ...rawEntity.value?._editor?.filter(x => editors.includes(x._id)).map(x => ({ ...x, type: 'editor' })) || [],
    ...rawEntity.value?._owner?.filter(x => owners.includes(x._id)).map(x => ({ ...x, type: 'owner' })) || []
  ].filter(x => !x.inherited).sort((a, b) => a.string?.localeCompare(b.string))
})

const inheritedRights = computed(() => {
  const owners = rawEntity.value?._parent_owner?.map(x => x._id) || []
  const editors = rawEntity.value?._parent_editor?.map(x => x._id).filter(x => !owners.includes(x)) || []
  const expanders = rawEntity.value?._parent_expander?.map(x => x._id).filter(x => !owners.includes(x) && !editors.includes(x)) || []
  const viewers = rawEntity.value?._parent_viewer?.map(x => x._id).filter(x => !owners.includes(x) && !editors.includes(x) && !expanders.includes(x)) || []

  return [
    ...rawEntity.value?._parent_viewer?.filter(x => viewers.includes(x._id)).map(x => ({ ...x, type: 'viewer' })) || [],
    ...rawEntity.value?._parent_expander?.filter(x => expanders.includes(x._id)).map(x => ({ ...x, type: 'expander' })) || [],
    ...rawEntity.value?._parent_editor?.filter(x => editors.includes(x._id)).map(x => ({ ...x, type: 'editor' })) || [],
    ...rawEntity.value?._parent_owner?.filter(x => owners.includes(x._id)).map(x => ({ ...x, type: 'owner' })) || []
  ].sort((a, b) => a.string?.localeCompare(b.string))
})

async function loadEntity () {
  isLoading.value = true

  if (entityId.value) {
    rawEntity.value = await apiGetEntity(entityId.value, [
      'name',
      '_noaccess',
      '_viewer',
      '_expander',
      '_editor',
      '_owner',
      '_parent_viewer',
      '_parent_expander',
      '_parent_editor',
      '_parent_owner',
      '_sharing',
      '_inheritrights'
    ])
  }

  sharing.value = getValue(rawEntity.value?._sharing) || 'private'
  inheritRights.value = getValue(rawEntity.value?._inheritrights, 'boolean') || false

  isLoading.value = false
}

async function updateSharing (value) {
  isUpdating.value = true

  const propertyId = getValue(rawEntity.value._sharing, '_id')

  if (value !== 'private') {
    const entity = await apiUpsertEntity(entityId.value, [
      { _id: propertyId, type: '_sharing', string: value }
    ])

    const { _id } = entity.properties.find(x => x.type === '_sharing')

    rawEntity.value._sharing = [{ _id, string: value }]
  } else {
    await apiDeleteProperty(propertyId)

    delete rawEntity.value._sharing
  }

  isUpdating.value = false
}

async function updateInheritRights (value) {
  isUpdating.value = true

  const propertyId = getValue(rawEntity.value._inheritrights, '_id')

  if (value === true) {
    const entity = await apiUpsertEntity(entityId.value, [
      { _id: propertyId, type: '_inheritrights', boolean: value }
    ])

    const { _id } = entity.properties.find(x => x.type === '_inheritrights')

    rawEntity.value._inheritrights = [{ _id, boolean: true }]
  } else {
    await apiDeleteProperty(propertyId)

    delete rawEntity.value._inheritrights
  }

  isUpdating.value = false
}

async function onAddRight (reference) {
  isUpdating.value = true

  await apiUpsertEntity(entityId.value, [
    { type: '_viewer', reference }
  ])

  setTimeout(async () => {
    await loadEntity()

    newRight.value = null
    isUpdating.value = false
  }, 2000)
}

async function onEditRight (_id, reference, right) {
  isUpdating.value = true

  if (right) {
    await apiUpsertEntity(entityId.value, [
      { _id, type: `_${right}`, reference }
    ])
  } else {
    await apiDeleteProperty(_id)
  }

  setTimeout(async () => {
    await loadEntity()

    isUpdating.value = false
  }, 2000)
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
    :width="600"
    @close="onClose()"
  >
    <div class="py-4 px-6 flex flex-col gap-12">
      <div class="w-full mt-4 flex flex-col justify-center items-center gap-4">
        <n-radio-group
          v-model:value="sharing"
          name="sharing"
          @update:value="updateSharing($event)"
        >
          <n-radio
            class="w-full"
            value="private"
            size="large"
            :label="t('sharingPrivate')"
          />
          <div class="ml-7 mb-6 text-gray-500">
            {{ t('sharingPrivateDescription') }}
          </div>

          <n-radio
            class="w-full"
            value="domain"
            size="large"
            :label="t('sharingDomain')"
          />
          <div class="ml-7 mb-6 text-gray-500">
            {{ t('sharingDomainDescription') }}
          </div>

          <n-radio
            class="w-full"
            value="public"
            size="large"
            :label="t('sharingPublic')"
          />
          <div class="ml-7 mb-6 text-gray-500">
            {{ t('sharingPublicDescription') }}
          </div>
        </n-radio-group>
      </div>

      <div>
        <n-divider class="!text-gray-500">
          {{ t('userRightsParent') }}
        </n-divider>

        <template v-if="inheritRights">
          <my-rights-switch
            v-for="user in inheritedRights"
            :key="user._id"
            v-model="user.type"
            class="mb-4 flex items-center justify-between gap-2"
            disabled
            :label="user.string?.trim() || user.reference"
            :to="{ path: `/${accountId}/${user.reference}` }"
          />
        </template>

        <div class="mt-6 flex flex-col items-center justify-center gap-2">
          <n-checkbox
            v-model:checked="inheritRights"
            size="large"
            @update:checked="updateInheritRights($event)"
          >
            {{ t('inheritRights') }}
          </n-checkbox>

          <div
            v-if="inheritRights"
            class="max-w-96 text-center text-sm text-gray-500"
          >
            {{ t('inheritRightsDescription') }}
          </div>
        </div>
      </div>

      <div>
        <n-divider class="!text-gray-500">
          {{ t('userRightsEntity') }}
        </n-divider>

        <my-rights-switch
          v-for="user in entityRights"
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
          v-model="newRight"
          class="mt-6"
          query="_type.string=person"
          :exclude="entityRights.map(x => x.reference)"
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
    sharingPrivate: Private
    sharingPrivateDescription: Only authorized users (below) can view this entity. Login is required.
    sharingDomain: Anyone with account
    sharingDomainDescription: All signed in users can view this entity. Login is required.
    sharingPublic: Public on the web
    sharingPublicDescription: Anyone on the Internet can view the public parameters of this entity. No login required.
    inheritRights: Inherit rights from parent
    inheritRightsDescription: Rights from the parent entity will be used for this entity. Add specific rights below to override inherited rights.
    userRightsParent: Parent entity rights
    userRightsEntity: Entity specific rights
    selectNewUser: Add new user
  et:
    title: Õigused - {name}
    sharingPrivate: Privaatne
    sharingPrivateDescription: Seda objekti saavad vaadata ainult õigustega kasutajad. Sisselogimine on vajalik.
    sharingDomain: Kõik kasutajad
    sharingDomainDescription: Kõik kasutajad saavad vaadata seda objekti. Sisselogimine on vajalik.
    sharingPublic: Objekt on avalik
    sharingPublicDescription: Igaüks Internetis saab vaadata selle objekti avalikke parameetreid. Sisselogimine pole vajalik.
    inheritRights: Päri õigused peamiselt objektilt
    inheritRightsDescription: Sellele objektile laienevad peamise objekti õigused. Õiguste muutmiseks lisa erisused objekti spetsiifiliste õiguste alla.
    userRightsParent: Peamise objekti õigused
    userRightsEntity: Objekti spetsiifilised õigused
    selectNewUser: Lisa uus kasutaja
</i18n>
