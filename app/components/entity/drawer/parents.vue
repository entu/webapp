<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NEmpty } from 'naive-ui'

const { query } = useRoute()
const { t } = useI18n()
const { accountId } = useAccount()
const { userId } = useUser()

const emit = defineEmits(['close'])

const show = defineModel('show', { type: Boolean, default: false })
const entityId = defineModel('entityId', { type: String, required: true })

const menuStore = useMenueStore()
const { addFromEntities } = storeToRefs(menuStore)

const rawEntity = ref()
const newParent = ref()
const canRemoveParents = ref([])
const isLoading = ref(false)
const isUpdating = ref(false)

const entityName = computed(() => getValue(rawEntity.value?.name))
const entityTypeId = computed(() => rawEntity.value?._type?.at(0)?.reference)
const parentQuery = computed(() => {
  const base = `_expander.reference=${userId.value}`
  if (!entityTypeId.value) return base
  const typeEntry = addFromEntities.value?.find((x) => x.value === entityTypeId.value)
  if (!typeEntry?.addFrom?.length) return base
  if (typeEntry.addFrom.length === 1) return `${base}&_type.reference=${typeEntry.addFrom.at(0)}`
  return `${base}&_type.reference.in=${typeEntry.addFrom.join(',')}`
})
const parents = computed(() => {
  const parentList = rawEntity.value?._parent || []
  return [...parentList].sort((a, b) => a.string?.localeCompare(b.string))
})

watch([show, entityId], loadEntity, { immediate: true })

async function loadEntity () {
  if (!show.value) return
  if (!entityId.value) return

  isLoading.value = true

  rawEntity.value = await apiGetEntity(entityId.value, [
    'name',
    '_parent',
    '_type'
  ])

  for (let i = 0; i < rawEntity.value._parent?.length; i++) {
    const parentId = rawEntity.value._parent[i].reference
    const parentEntity = await apiGetEntity(parentId, ['_expander'])

    if (parentEntity?._expander?.some((x) => x.reference === userId.value)) {
      canRemoveParents.value.push(parentId)
    }
  }

  isLoading.value = false
}

async function onAddParent (reference) {
  isUpdating.value = true

  await apiUpsertEntity(entityId.value, [
    { type: '_parent', reference }
  ])

  setTimeout(async () => {
    await loadEntity()

    newParent.value = null
    isUpdating.value = false
  }, 2000)
}

async function onDeleteParent (_id) {
  isUpdating.value = true

  await apiDeleteProperty(_id)

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
    v-model:show="show"
    :is-loading="isLoading || isUpdating"
    :title="t('title', { name: entityName })"
    :width="500"
    @close="onClose()"
  >
    <div class="px-3 py-4 md:px-6">
      <div
        v-for="parent in parents"
        :key="parent._id"
        class="mb-2 flex items-center justify-between gap-2"
      >
        <nuxt-link
          class="link overflow-hidden truncate whitespace-nowrap"
          :to="{ path: `/${accountId}/${parent.reference}`, query }"
        >
          {{ parent.string || parent.reference }}
        </nuxt-link>

        <my-button
          v-if="canRemoveParents.includes(parent.reference)"
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
        v-model="newParent"
        class="my-6"
        :placeholder="t('selectNewParent')"
        :query="parentQuery"
        :exclude="[...parents.map(x => x.reference), entityId]"
        @update:value="onAddParent($event)"
      />
    </div>
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
