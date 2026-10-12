<script setup>
import { NButton, NSelect, NSpin, NTab, NTabs } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const { accountId } = useAccount()
const { userId, tablePageSize } = useUser()

const entityTypeStore = useEntityTypeStore()
const { entityTypes } = storeToRefs(entityTypeStore)

const contentRef = useTemplateRef('contentRef')
const { width: contentWidth } = useElementSize(contentRef)
const isNarrow = computed(() => contentWidth.value < 500)

const { rawEntity, right, typeId } = useEntity()

const entityId = ref(route.params.entityId)
const newEntityId = ref()
const rawChilds = ref([])
const rawReferences = ref([])
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
const { url: thumbnailUrl } = useEntityThumbnail(thumbnailEntityId, 400)

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

const childs = computed(() => [
  ...rawChilds.value.map((x) => ({
    _id: x._id,
    key: `child-${x._id}`,
    type: 'child',
    label: getValue(x.label_plural) || getValue(x.label) || getValue(x.name),
    count: x._count,
    referenceField: '_parent.reference'
  })),
  ...rawReferences.value.map((x) => ({
    _id: x._id,
    key: `reference-${x._id}`,
    type: 'reference',
    label: getValue(x.label_plural) || getValue(x.label) || getValue(x.name),
    count: x._count,
    referenceField: '_reference.reference'
  }))
].sort((a, b) => `${a.type} - ${a.label}`.localeCompare(`${b.type} - ${b.label}`)))

const selectedChildKey = ref()
const selectedChild = computed(() => childs.value.find((x) => x.key === selectedChildKey.value) || childs.value.at(0))
const childPage = ref(1)
const childTotal = ref(0)
const childPages = computed(() => Math.max(1, Math.ceil(childTotal.value / tablePageSize.value)))
const pageSizeOptions = computed(() => [10, 25, 100, 250].map((x) => ({ label: t('pageSize', { n: x }), value: x })))

// Switching the child type starts its table from the first page.
function onChildTabChange (key) {
  selectedChildKey.value = key
  childPage.value = 1
  childTotal.value = 0
}

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

async function loadChilds () {
  rawChilds.value = []

  const { entities } = await apiGetEntities({
    '_parent.reference': entityId.value,
    group: '_type.reference',
    props: '_type'
  })

  rawChilds.value = (await Promise.all(entities.map(async (x) => {
    const type = getValue(x._type, 'reference')

    if (!type) return

    const rawType = await apiGetEntity(type, [
      'label_plural',
      'label',
      'name'
    ])

    return { ...rawType, _count: x._count }
  }))).filter(Boolean)
}

async function loadReferences () {
  rawReferences.value = []

  const { entities } = await apiGetEntities({
    '_reference.reference': entityId.value,
    '_reference.property_type.ne': '_parent',
    group: '_type.reference',
    props: '_type'
  })

  rawReferences.value = (await Promise.all(entities.map(async (x) => {
    const type = getValue(x._type, 'reference')

    if (!type) return

    const rawType = await apiGetEntity(type, [
      'label_plural',
      'label',
      'name'
    ])

    return { ...rawType, _count: x._count }
  }))).filter(Boolean)
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

onMounted(async () => {
  loadEntity()
  loadChilds()
  loadReferences()
})

onUnmounted(() => {
  rawEntity.value = null
})
</script>

<template>
  <div class="relative flex h-full flex-col">
    <transition>
      <div
        v-if="rawEntity"
        ref="contentRef"
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
              class="pt-6 pb-1.5 font-semibold tracking-wider text-gray-400 uppercase md:pl-39"
            >
              {{ pg.name }}
            </h2>

            <property-list
              v-if="pg.children && pg.children.some(x => x.mandatory || x.values)"
              :entity-sharing="entity._sharing"
              :properties="pg.children"
            />
          </template>

          <div
            v-if="selectedChild"
            class="mt-10"
          >
            <n-tabs
              class="mb-2 [&_.n-tabs-nav]:flex-wrap [&_.n-tabs-nav]:justify-between [&_.n-tabs-nav]:gap-y-2 [&_.n-tabs-nav\_\_suffix]:ml-auto [&_.n-tabs-rail]:max-w-full [&_.n-tabs-rail]:overflow-x-auto [&_.n-tabs-tab]:px-4!"
              type="segment"
              :class="{ '[&_.n-tabs-rail]:w-fit! [&_.n-tabs-tab-wrapper]:flex-none!': !isNarrow }"
              :theme-overrides="{ tabBorderRadius: '9999px' }"
              :value="selectedChild.key"
              @update:value="onChildTabChange($event)"
            >
              <n-tab
                v-for="child in childs"
                :key="child.key"
                :name="child.key"
              >
                {{ child.label }}
                <span class="ml-1.5 text-gray-400">{{ child.count }}</span>
              </n-tab>

              <template #suffix>
                <div
                  v-if="childTotal > 10"
                  class="flex items-center gap-2"
                >
                  <n-button
                    quaternary
                    :disabled="childPage <= 1"
                    @click="childPage--"
                  >
                    <my-icon icon="arrow-left" />
                  </n-button>
                  <span class="text-sm whitespace-nowrap text-gray-500 tabular-nums">
                    {{ childPage }} / {{ childPages }}
                  </span>
                  <n-button
                    quaternary
                    :disabled="childPage >= childPages"
                    @click="childPage++"
                  >
                    <my-icon icon="arrow-right" />
                  </n-button>
                  <n-select
                    v-model:value="tablePageSize"
                    class="w-24"
                    :consistent-menu-width="false"
                    :options="pageSizeOptions"
                  />
                </div>
              </template>
            </n-tabs>

            <entity-child-list
              :key="selectedChild.key"
              v-model:page="childPage"
              v-model:total="childTotal"
              class="w-full"
              :entity-id="entityId"
              :page-size="tablePageSize"
              :reference-field="selectedChild.referenceField"
              :type-id="selectedChild._id"
            />
          </div>
        </div>
      </div>
    </transition>

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

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

<i18n lang="yaml">
  en:
    error404: Entity not found or you do not have access to it
    pageSize: '{n} / page'
  et:
    pageSize: '{n} / lk'
    error404: Objekti ei leitud või sul puudub ligipääs sellele
</i18n>
