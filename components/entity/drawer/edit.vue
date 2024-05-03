<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NPopconfirm, NTabs, NTabPane } from 'naive-ui'

const { locale, t } = useI18n()

const emit = defineEmits(['close', 'delete'])

const entityId = defineModel('entityId', { type: String, default: undefined })
const entityParentId = defineModel('entityParentId', { type: String, default: undefined })
const entityTypeId = defineModel('entityTypeId', { type: String, default: undefined })

const props = defineProps({
  canDelete: { type: Boolean, default: false }
})

const entityTypeStore = useEntityTypeStore()
const { entityTypes } = storeToRefs(entityTypeStore)

const rawEntity = ref()
const isLoading = ref(false)
const isUpdating = ref(false)

const typeId = computed(() => props.entityTypeId || getValue(rawEntity.value?._type, 'reference'))

const title = computed(() => {
  if (entityParentId.value) {
    return t('titleChild', { name: entity.value.type?.label?.toLowerCase() })
  }
  if (!entityParentId.value && entityTypeId.value) {
    return t('titleAdd', { name: entity.value.type?.label?.toLowerCase() })
  }
  if (!entityParentId.value && entityId.value) {
    return t('titleEdit', { name: entity.value.type?.label?.toLowerCase() })
  }
})

const entityType = computed(() => entityTypes.value?.[typeId.value] || {})

const plugins = computed(() => entityType.value?.plugins?.filter(x => x.type === (entityId.value ? 'entity-edit' : 'entity-add')).map((x) => {
  const url = new URL(x.url)

  if (entityId.value) {
    url.searchParams.append('entity', entityId.value)
  }
  if (entityParentId.value) {
    url.searchParams.append('parent', entityParentId.value)
  }
  if (entityTypeId.value) {
    url.searchParams.append('type', entityTypeId.value)
  }

  return {
    ...x,
    url: url.toString()
  }
}) || [])

const entity = computed(() => {
  const result = {
    _id: rawEntity.value?._id,
    name: getValue(rawEntity.value?.name),
    type: entityType.value?.type || {},
    props: entityTypes.value[typeId.value]?.props.map(x => ({ ...x, values: [] })) || []
  }

  for (const property in rawEntity.value) {
    const existingProperty = result.props.find(x => x.name === property)

    if (existingProperty) {
      existingProperty.values = rawEntity.value[property]
    } else {
      result.props.push({ name: property, values: rawEntity.value[property] })
    }
  }

  return result
})

const properties = computed(() => {
  if (!entity.value || !entity?.value?.props) return []

  const propsObject = {}

  entity.value.props.forEach((property) => {
    if (!property.type) return
    if (property.name?.startsWith('_')) return
    if (property.readonly) return
    if (property.formula) return
    if (property.hidden) return

    const group = property.group || ''
    const ordinal = property.ordinal || 0

    if (!propsObject[group]) {
      propsObject[group] = {
        name: group,
        children: [],
        ordinal: 0
      }
    }

    if (property.list || property.values?.length === 0) {
      const empty = {}

      if (property.multilingual) {
        empty.language = locale.value
      }

      if (property.default) {
        empty.string = property.default
      }

      property.values.push(empty)
    }

    propsObject[group].ordinal += ordinal
    propsObject[group].children.push(property)
  })

  const result = Object.values(propsObject)

  result.forEach((m) => {
    m.ordinal = m.name ? m.ordinal / m.children.length : 0
    m.children.sort(propsSorter)
  })

  result.sort(propsSorter)

  return result
})

watch([entityId, () => props.entityTypeId], loadEntity, { immediate: true })

async function loadEntity () {
  isLoading.value = true

  if (entityId.value) {
    rawEntity.value = await apiGetEntity(entityId.value)
  }

  if (typeId.value && !entityTypes.value[typeId.value]) {
    entityTypeStore.get(typeId.value)
  }

  isLoading.value = false
}

async function onClose () {
  await until(isUpdating).not.toBeTruthy()

  emit('close')
}

async function onDelete () {
  if (!entityId.value) return

  isUpdating.value = true

  await apiDeleteEntity(entityId.value)

  isUpdating.value = false

  emit('delete')
}
</script>

<template>
  <my-drawer
    :is-loading="isLoading"
    :title="title"
    @close="onClose()"
  >
    <n-tabs
      animated
      default-value="default"
      :class="plugins?.length ? 'mt-3' : ''"
      :tab-class="plugins?.length ? '' : '!hidden'"
      :type="plugins?.length ? 'segment' : 'bar'"
    >
      <n-tab-pane
        name="default"
        :tab="t('defaultPlugin')"
      >
        <template
          v-for="pg in properties"
          :key="pg.name"
        >
          <h2
            v-if="pg.name"
            class="pt-6 px-1 text-center text-gray-500 font-bold uppercase"
          >
            {{ pg.name }}
          </h2>

          <property-list
            v-model:entity-id="entityId"
            v-model:properties="pg.children"
            v-model:entity-parent-id="entityParentId"
            v-model:entity-type-id="entityTypeId"
            v-model:is-updating="isUpdating"
            edit
          />
        </template>
      </n-tab-pane>

      <n-tab-pane
        v-for="plugin in plugins"
        :key="plugin._id"
        :name="plugin._id"
        :tab="plugin.name"
      >
        <iframe
          :src="plugin.url"
          class="size-full"
          frameborder="0"
        />
      </n-tab-pane>
    </n-tabs>

    <template
      v-if="canDelete && entityId"
      #footer
    >
      <n-popconfirm
        :negative-text="t('cancel')"
        :positive-text="t('delete')"
        :positive-button-props="{ type: 'error', loading: isUpdating }"
        @positive-click="onDelete()"
      >
        <template #trigger>
          <my-button
            :bg="false"
            type="error"
            :disabled="isUpdating"
            :focusable="false"
            :label="t('deleteEntity')"
          />
        </template>

        <template #icon>
          <my-icon
            class="text-red-500"
            icon="delete"
          />
        </template>

        {{ t('confirmDelete') }}
      </n-popconfirm>
    </template>
  </my-drawer>
</template>

<i18n lang="yaml">
  en:
    titleAdd: Add new {name}
    titleChild: Add {name} as a new child
    titleEdit: Edit {name}
    defaultPlugin: Manual input
    deleteEntity: Delete entity
    confirmDelete: Are you sure you want to delete this entity?
    delete: Delete
    cancel: Cancel
  et:
    titleAdd: Lisa uus {name}
    titleChild: Lisa {name} uue alamobjektina
    titleEdit: Muuda objekti {name}
    defaultPlugin: Sisesta käsitsi
    deleteEntity: Kustuta objekt
    confirmDelete: Kas oled kindel, et soovid selle objekti kustutada?
    delete: Kustuta
    cancel: Tühista
</i18n>
