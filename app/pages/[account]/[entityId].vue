<script setup>
import { NCollapse, NCollapseItem, NSpin } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const { accountId } = useAccount()
const { userId } = useUser()

const entityTypeStore = useEntityTypeStore()
const { entityTypes } = storeToRefs(entityTypeStore)

const contentRef = ref()
const { width: contentWidth } = useElementSize(contentRef)
const isNarrow = computed(() => contentWidth.value < 600)

const entityId = ref(route.params.entityId)
const newEntityId = ref()
const rawEntity = ref()
const rawChilds = ref([])
const rawReferences = ref([])
const isLoading = ref(false)

const typeId = computed(() => getValue(rawEntity.value?._type, 'reference'))
const typeName = computed(() => getValue(rawEntity.value?._type, 'string'))

const entity = computed(() => {
  if (!rawEntity.value) return {}

  const result = {
    _id: rawEntity.value._id,
    _thumbnail: rawEntity.value._thumbnail,
    _sharing: getValue(rawEntity.value._sharing),
    name: getValue(rawEntity.value.name),
    type: cloneData(entityTypes.value[typeId.value]?.type || {}),
    props: cloneData(entityTypes.value[typeId.value]?.props || [])
  }

  for (const property in rawEntity.value) {
    if (['_id', '_thumbnail'].includes(property)) continue

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

const properties = computed(() => {
  if (!entity.value || !entity?.value?.props) return []

  const propsObject = {}

  entity.value.props.forEach((property) => {
    if (property.name?.startsWith('_') && property.label === undefined) return
    if (property.name === 'name') return
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

    propsObject[group].ordinal += ordinal
    propsObject[group].children.push(property)
  })

  const result = Object.values(propsObject)

  result.forEach((m) => {
    m.ordinal = m.name ? m.ordinal / m.children.length : 0
    m.children.sort(propsSorter)
  })

  result.sort(propsSorter)

  return result.filter((x) => x.children.some((y) => y.mandatory || y.values))
})

const childs = computed(() => [
  ...rawChilds.value.map((x) => ({
    _id: x._id,
    type: 'child',
    label: getValue(x.label_plural) || getValue(x.label) || getValue(x.name),
    count: t('childsCount', x._count),
    referenceField: '_parent.reference'
  })),
  ...rawReferences.value.map((x) => ({
    _id: x._id,
    type: 'reference',
    label: getValue(x.label_plural) || getValue(x.label) || getValue(x.name),
    count: t('referrersCount', x._count),
    referenceField: '_reference.reference'
  }))
].sort((a, b) => `${a.type} - ${a.label}`.localeCompare(`${b.type} - ${b.label}`)))

const right = computed(() => ({
  owner: rawEntity.value?._owner?.some((x) => x.reference === userId.value) || false,
  editor: rawEntity.value?._editor?.some((x) => x.reference === userId.value) || false,
  expander: rawEntity.value?._expander?.some((x) => x.reference === userId.value) || false,
  viewer: rawEntity.value?._viewer?.some((x) => x.reference === userId.value) || false
}))

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
    if (!value) onDrawerClose()
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
    if (!value) onDrawerClose()
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
    if (!value) onDrawerClose()
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
    if (!value) onDrawerClose()
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
    if (!value) onDrawerClose()
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
    if (!value) onDrawerClose()
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
    if (!value) onDrawerClose()
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
    if (!value) onDrawerClose()
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
    if (!value) onDrawerClose()
  }
})

watch(() => entity?.value?.name, (value) => {
  if (value) {
    useHead({ title: `${value} · ${accountId.value}` })
  }
  else {
    useHead({ title: accountId.value })
  }
}, { immediate: true })

async function loadEntity () {
  if (!entityId.value) return

  isLoading.value = true

  rawEntity.value = await apiGetEntity(entityId.value)

  if (!rawEntity.value) return showError({ statusCode: 404, statusMessage: t('error404') })

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
</script>

<template>
  <div class="relative flex h-full flex-col">
    <entity-toolbar
      :entity-id="entityId"
      :right="right"
      :type-id="typeId"
      :type-name="typeName"
    />

    <transition>
      <div
        v-if="rawEntity"
        ref="contentRef"
        class="flex flex-col overflow-hidden overflow-y-auto px-2 pb-20 print:pb-0"
      >
        <div
          v-if="rawEntity?._parent"
          class="border-b border-gray-300 py-4"
        >
          <entity-parent-list :parents="rawEntity._parent" />
        </div>

        <div class="pt-5">
          <h1
            class="mb-4 text-center text-2xl font-bold text-[#1E434C] md:pl-5 md:text-left"
            @click="$event.altKey && navigateTo({ path: route.path, query: route.query, hash: '#debug' }, { replace: true })"
          >
            {{ entity.name?.trim() || entity._id }}
          </h1>

          <!-- Narrow: thumbnail + type + sharing centered between title and properties -->
          <div
            v-if="isNarrow && (userId || entity._thumbnail)"
            class="mb-5 flex flex-col items-center gap-3"
          >
            <entity-meta-info
              :entity="entity"
              :right="right"
              :narrow="true"
              :thumbnail="entity._thumbnail"
              :photos="rawEntity.photo"
            />
          </div>

          <!-- Wide: properties + thumbnail side by side -->
          <div :class="isNarrow ? '' : 'flex flex-row gap-5 pr-5'">
            <div class="grow">
              <template
                v-for="pg in properties"
                :key="pg.name"
              >
                <h2
                  v-if="pg.name"
                  class="px-1 pt-6 text-center font-bold uppercase text-gray-500"
                >
                  {{ pg.name }}
                </h2>

                <property-list
                  v-if="pg.children && pg.children.some(x => x.mandatory || x.values)"
                  class="md:pl-5"
                  :properties="pg.children"
                  :entity-sharing="entity._sharing"
                />
              </template>
            </div>

            <!-- Wide: thumbnail + type + sharing in right column -->
            <div
              v-if="!isNarrow && (userId || entity._thumbnail)"
              class="flex min-w-32 flex-col gap-3"
            >
              <entity-meta-info
                :entity="entity"
                :right="right"
                :narrow="false"
                :thumbnail="entity._thumbnail"
                :photos="rawEntity.photo"
              />
            </div>
          </div>
        </div>

        <n-collapse
          :default-expanded-names="[0]"
          class="mt-8 md:pr-5"
        >
          <n-collapse-item
            v-for="child, idx in childs"
            :key="child._id"
            :name="idx"
            :title="child.label"
          >
            <template #header-extra>
              <span class="text-gray-400">{{ child.count }}</span>
            </template>

            <entity-child-list
              class="w-full md:pl-5"
              :entity-id="entityId"
              :type-id="child._id"
              :reference-field="child.referenceField"
            />
          </n-collapse-item>
        </n-collapse>
      </div>
    </transition>

    <div
      v-if="isLoading"
      class="flex size-full items-center justify-center"
    >
      <n-spin />
    </div>

    <entity-drawer-edit
      v-model:show="showAddDrawer"
      v-model:entity-id="newEntityId"
      :entity-type-id="addTypeId"
    />
    <entity-drawer-edit
      v-model:show="showChildDrawer"
      v-model:entity-id="newEntityId"
      :entity-parent-id="entityId"
      :entity-type-id="addTypeId"
    />
    <entity-drawer-edit
      v-model:show="showEditDrawer"
      v-model:entity-id="entityId"
      :can-delete="right.owner"
      @delete="router.back()"
    />
    <entity-drawer-edit
      v-model:show="showEditChildDrawer"
      v-model:entity-id="addTypeId"
      @close="onChildEditClose()"
    />
    <entity-drawer-duplicate
      v-model:show="showDuplicateDrawer"
      v-model:entity-id="entityId"
    />
    <entity-drawer-parents
      v-model:show="showParentsDrawer"
      v-model:entity-id="entityId"
    />
    <entity-drawer-rights
      v-model:show="showRightsDrawer"
      v-model:entity-id="entityId"
    />
    <entity-drawer-debug
      v-model:show="showDebugDrawer"
      :entity="entity"
      :properties="properties"
      :raw-entity="rawEntity"
    />
    <entity-drawer-history
      v-model:show="showHistoryDrawer"
      v-model:entity-id="entityId"
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
    childsCount: 'no childs | {n} child | {n} childs'
    referrersCount: 'no referrers | {n} referrer | {n} referrers'
    error404: Entity not found or you do not have access to it
  et:
    childsCount: 'alamobjekte pole | {n} alamobjekt | {n} alamobjekti'
    referrersCount: 'viitajaid pole | {n} viitaja | {n} viitajat'
    error404: Objekti ei leitud või sul puudub ligipääs sellele
</i18n>
