<script setup>
import { NSpin } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const { accountId } = useAccount()
const { userId } = useUser()

const entityTypeStore = useEntityTypeStore()
const { entityTypes } = storeToRefs(entityTypeStore)

const contentRef = useTemplateRef('contentRef')
const { width: contentWidth } = useElementSize(contentRef)
const isNarrow = computed(() => contentWidth.value < 500)

const { headerGradient, rawEntity, right, typeId } = useEntity()

const entityId = ref(route.params.entityId)
const newEntityId = ref()
const isLoading = ref(false)

const entity = computed(() => {
  if (!rawEntity.value) {
    return {}
  }

  const result = {
    _id: rawEntity.value._id,
    _sharing: getValue(rawEntity.value._sharing),
    name: getValue(rawEntity.value.name),
    type: cloneData(entityTypes.value[typeId.value]?.type || {}),
    props: cloneData(entityTypes.value[typeId.value]?.props || [])
  }

  for (const property in rawEntity.value) {
    if (property === '_id') continue

    const existingProperty = result.props.find((x) => x.name === property)

    if (existingProperty) {
      existingProperty.values = rawEntity.value[property]
    }
    else {
      result.props.push({ name: property, values: rawEntity.value[property] })
    }
  }

  return result
})

const thumbnailEntityId = computed(() => rawEntity.value?.photo?.length ? rawEntity.value._id : undefined)
const { url: thumbnailUrl, color: thumbnailColor } = useEntityThumbnail(thumbnailEntityId, 400)

useEntityGradient(entityId, thumbnailColor)

const properties = computed(() => {
  if (!entity.value || !entity?.value?.props) {
    return []
  }

  const propsObject = {}

  for (const property of entity.value.props) {
    if (property.name?.startsWith('_') && property.label === undefined) continue
    if (property.name === 'name') continue
    if (property.hidden) continue

    const group = property.group || ''
    const ordinal = property.ordinal || 0

    if (!propsObject[group]) {
      propsObject[group] = {
        name: group,
        children: [],
        ordinal: 0
      }
    }

    propsObject[group].ordinal += ordinal
    propsObject[group].children.push(property)
  }

  const result = Object.values(propsObject)

  for (const m of result) {
    m.ordinal = m.name ? m.ordinal / m.children.length : 0
    m.children.sort(propsSorter)
  }

  result.sort(propsSorter)

  return result.filter((x) => x.children.some((y) => y.mandatory || y.values))
})

const drawerType = computed(() => userId.value ? route.hash.replace('#', '').split('-').at(0) : undefined)

const addTypeId = computed(() => userId.value ? route.hash.split('-').at(1) : undefined)

const showAddDrawer = computed({
  get: () => {
    if (drawerType.value === 'add') {
      useAnalytics('show_add')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})
const showChildDrawer = computed({
  get: () => {
    if (drawerType.value === 'child') {
      useAnalytics('show_child')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})
const showEditDrawer = computed({
  get: () => {
    if (drawerType.value === 'edit' && !addTypeId.value) {
      useAnalytics('show_edit')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})
const showEditChildDrawer = computed({
  get: () => {
    if (drawerType.value === 'edit' && addTypeId.value) {
      useAnalytics('show_edit_child')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})
const showDuplicateDrawer = computed({
  get: () => {
    if (drawerType.value === 'duplicate') {
      useAnalytics('show_duplicate')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})
const showParentsDrawer = computed({
  get: () => {
    if (drawerType.value === 'parents') {
      useAnalytics('show_parents')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})
const showRightsDrawer = computed({
  get: () => {
    if (drawerType.value === 'rights') {
      useAnalytics('show_rights')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})
const showDebugDrawer = computed({
  get: () => {
    if (drawerType.value === 'debug') {
      useAnalytics('show_debug')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})
const showHistoryDrawer = computed({
  get: () => {
    if (drawerType.value === 'history') {
      useAnalytics('show_history')
      return true
    }
    return false
  },
  set: (value) => {
    if (!value) {
      onDrawerClose()
    }
  }
})

watch(() => entity?.value?.name, (value) => {
  if (value) {
    useHeadSafe({ title: `${value} · ${accountId.value}` })
  }
  else {
    useHeadSafe({ title: accountId.value })
  }
}, { immediate: true })

async function loadEntity () {
  if (!entityId.value) return

  isLoading.value = true

  rawEntity.value = await apiGetEntity(entityId.value)

  if (!rawEntity.value) {
    return showError({ statusCode: 404, statusMessage: t('error404') })
  }

  if (typeId.value && !entityTypes.value[typeId.value]) {
    entityTypeStore.get(typeId.value)
  }

  isLoading.value = false
}

async function onDrawerClose () {
  if (newEntityId.value) {
    await navigateTo({ path: `/${accountId.value}/${newEntityId.value}`, query: route.query, hash: undefined }, { replace: true })
  }
  else {
    await navigateTo({ path: route.path, query: route.query, hash: undefined }, { replace: true })

    loadEntity()
  }
}

async function onChildEditClose (_id) {
  await navigateTo({ path: route.path, query: route.query, hash: undefined }, { replace: true })
}

onMounted(() => {
  loadEntity()
})

onUnmounted(() => {
  rawEntity.value = null
})
</script>

<template>
  <div
    ref="contentRef"
    class="relative flex h-full flex-col"
  >
    <!-- Band in the entity's color while it loads, so the header doesn't pop in under the toolbar -->
    <div
      v-if="!rawEntity"
      class="shrink-0 bg-fixed print:hidden"
      :class="{
        'min-h-24': isNarrow,
        'min-h-28': !isNarrow,
      }"
      :style="{ backgroundImage: headerGradient }"
    />

    <div
      v-if="rawEntity"
      class="flex flex-col overflow-hidden overflow-y-auto pb-20 print:pb-0"
    >
      <entity-header
        :entity="entity"
        :narrow="isNarrow"
        :parents="rawEntity._parent"
        :photos="rawEntity.photo"
        :right="right"
        :thumbnail="thumbnailUrl"
      />

      <div
        :class="{
          'px-4': isNarrow,
          'px-7': !isNarrow,
        }"
      >
        <template
          v-for="pg in properties"
          :key="pg.name"
        >
          <h2
            v-if="pg.name"
            class="pt-6 pb-1.5 font-semibold tracking-wider text-slate-400 uppercase md:pl-39 dark:text-slate-500"
          >
            {{ pg.name }}
          </h2>

          <property-list
            v-if="pg.children && pg.children.some(x => x.mandatory || x.values)"
            :entity-sharing="entity._sharing"
            :properties="pg.children"
          />
        </template>

        <entity-child-tabs
          class="mt-10"
          :entity-id="entityId"
          :narrow="isNarrow"
        />
      </div>
    </div>

    <div
      v-if="isLoading"
      class="flex size-full items-center justify-center"
    >
      <n-spin />
    </div>

    <entity-drawer-edit
      v-model:entity-id="newEntityId"
      v-model:show="showAddDrawer"
      :entity-type-id="addTypeId"
    />
    <entity-drawer-edit
      v-model:entity-id="newEntityId"
      v-model:show="showChildDrawer"
      :entity-parent-id="entityId"
      :entity-type-id="addTypeId"
    />
    <entity-drawer-edit
      v-model:entity-id="entityId"
      v-model:show="showEditDrawer"
      :can-delete="right.owner"
      @delete="router.back()"
    />
    <entity-drawer-edit
      v-model:entity-id="addTypeId"
      v-model:show="showEditChildDrawer"
      @close="onChildEditClose()"
    />
    <entity-drawer-duplicate
      v-model:entity-id="entityId"
      v-model:show="showDuplicateDrawer"
    />
    <entity-drawer-parents
      v-model:entity-id="entityId"
      v-model:show="showParentsDrawer"
    />
    <entity-drawer-rights
      v-model:entity-id="entityId"
      v-model:show="showRightsDrawer"
    />
    <entity-drawer-debug
      v-model:show="showDebugDrawer"
      :entity="entity"
      :properties="properties"
      :raw-entity="rawEntity"
    />
    <entity-drawer-history
      v-model:entity-id="entityId"
      v-model:show="showHistoryDrawer"
      :type-id="typeId"
    />
  </div>
</template>

<i18n lang="yaml">
  en:
    error404: Entity not found or you do not have access to it
  et:
    error404: Objekti ei leitud või sul puudub ligipääs sellele
</i18n>
