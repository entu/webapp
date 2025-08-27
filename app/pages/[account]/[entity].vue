<script setup>
import { NCollapse, NCollapseItem, NPopover, NSpin } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const { accountId } = useAccount()
const { userId } = useUser()

const entityTypeStore = useEntityTypeStore()
const { entityTypes } = storeToRefs(entityTypeStore)

const entityId = ref(route.params.entity)
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

  return result
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

// Drawer visibility computed properties
const showAddDrawer = computed({
  get: () => drawerType.value === 'add',
  set: (value) => { if (!value) onDrawerClose() }
})
const showChildDrawer = computed({
  get: () => drawerType.value === 'child',
  set: (value) => { if (!value) onDrawerClose() }
})
const showEditDrawer = computed({
  get: () => drawerType.value === 'edit',
  set: (value) => { if (!value) onDrawerClose() }
})
const showDuplicateDrawer = computed({
  get: () => drawerType.value === 'duplicate',
  set: (value) => { if (!value) onDrawerClose() }
})
const showParentsDrawer = computed({
  get: () => drawerType.value === 'parents',
  set: (value) => { if (!value) onDrawerClose() }
})
const showRightsDrawer = computed({
  get: () => drawerType.value === 'rights',
  set: (value) => { if (!value) onDrawerClose() }
})
const showDebugDrawer = computed({
  get: () => drawerType.value === 'debug',
  set: (value) => { if (!value) onDrawerClose() }
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

  rawEntity.value = await apiGetEntity(entityId.value)

  if (!rawEntity.value) return showError({ statusCode: 404, statusMessage: t('error404') })

  if (typeId.value && !entityTypes.value[typeId.value]) {
    entityTypeStore.get(typeId.value)
  }
}

async function loadChilds () {
  const { entities } = await apiGetEntities({
    '_parent.reference': entityId.value,
    group: '_type.reference',
    props: '_type'
  })

  entities.forEach(async (x) => {
    const type = getValue(x._type, 'reference')

    if (!type) return

    const rawType = await apiGetEntity(type, [
      'label_plural',
      'label',
      'name'
    ])

    rawChilds.value.push({
      ...rawType,
      _count: x._count
    })
  })
}

async function loadReferences () {
  const { entities } = await apiGetEntities({
    '_reference.reference': entityId.value,
    '_reference.property_type.ne': '_parent',
    group: '_type.reference',
    props: '_type'
  })

  entities.forEach(async (x) => {
    const type = getValue(x._type, 'reference')

    if (!type) return

    const rawType = await apiGetEntity(type, [
      'label_plural',
      'label',
      'name'
    ])

    rawReferences.value.push({
      ...rawType,
      _count: x._count
    })
  })
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

onMounted(async () => {
  isLoading.value = true

  loadEntity()
  loadChilds()
  loadReferences()

  isLoading.value = false
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
        class="flex flex-col overflow-hidden overflow-y-auto px-2 pb-20"
      >
        <div
          v-if="rawEntity?._parent"
          class="border-b border-gray-300 py-4"
        >
          <entity-parent-list :parents="rawEntity._parent" />
        </div>

        <div class="flex gap-5 pr-5 pt-5">
          <div class="grow">
            <h1
              class="mb-4 pl-5 text-2xl font-bold text-[#1E434C]"
              @click="$event.altKey && navigateTo({ path: route.path, query: route.query, hash: '#debug' }, { replace: true })"
            >
              {{ entity.name?.trim() || entity._id }}
            </h1>

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
                class="pl-5"
                :properties="pg.children"
                :entity-sharing="entity._sharing"
              />
            </template>
          </div>

          <div
            v-if="userId || entity._thumbnail"
            class="flex min-w-32 flex-col gap-3"
          >
            <entity-thumbnail
              v-if="entity._thumbnail"
              class="w-full flex-none"
              :thumbnail="entity._thumbnail"
              :photos="rawEntity.photo"
            />

            <template v-if="userId">
              <nuxt-link
                v-if="entity.type.label"
                class="rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-center text-xs hover:bg-slate-200"
                :to="{ path: `/${accountId}/${entity.type._id}`, query: route.query }"
              >
                {{ entity.type.label }}
              </nuxt-link>

              <n-popover
                v-if="!entity._sharing"
                class="max-w-sm"
                placement="left"
              >
                <template #trigger>
                  <nuxt-link
                    class="flex items-center justify-center gap-1 rounded-md border border-green-300 bg-green-50 px-2 py-1 text-center text-xs text-green-600"
                    :to="right.owner ? { path: route.path, query: route.query, hash: '#rights' } : {}"
                  >
                    <my-icon icon="sharing-private" />

                    {{ t('sharingPrivate') }}
                  </nuxt-link>
                </template>
                <div class="text-sm">
                  {{ t('sharingPrivateDescription') }}
                </div>
              </n-popover>

              <n-popover
                v-if="entity._sharing === 'domain'"
                class="max-w-sm"
                placement="left"
              >
                <template #trigger>
                  <nuxt-link
                    class="flex items-center justify-center gap-1 rounded-md border border-yellow-300 bg-yellow-50 px-2 py-1 text-center text-xs text-yellow-600"
                    :to="right.owner ? { path: route.path, query: route.query, hash: '#rights' } : {}"
                  >
                    <my-icon icon="sharing-domain" />

                    {{ t('sharingDomain') }}
                  </nuxt-link>
                </template>
                <div class="text-sm">
                  {{ t('sharingDomainDescription') }}
                </div>
              </n-popover>

              <n-popover
                v-if="entity._sharing === 'public'"
                class="max-w-sm"
                placement="left"
              >
                <template #trigger>
                  <nuxt-link
                    class="flex items-center justify-center gap-1 rounded-md border border-orange-300 bg-orange-50 px-2 py-1 text-center text-xs text-orange-600"
                    :to="right.owner ? { path: route.path, query: route.query, hash: '#rights' } : {}"
                  >
                    <my-icon icon="sharing-public" />

                    {{ t('sharingPublic') }}
                  </nuxt-link>
                </template>
                <div class="text-sm">
                  {{ t('sharingPublicDescription') }}
                </div>
              </n-popover>
            </template>
          </div>
        </div>

        <n-collapse
          :default-expanded-names="[0]"
          class="mt-8 pr-5"
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
              class="w-full pl-5"
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
  </div>
</template>

<i18n lang="yaml">
  en:
    sharingPrivate: Private
    sharingPrivateDescription: Only authorized users (below) can view this entity. Login is required.
    sharingDomain: Anyone with account
    sharingDomainDescription: All signed in users can view this entity. Login is required.
    sharingPublic: Public on the web
    sharingPublicDescription: Anyone on the Internet can view the public parameters of this entity. No login required.
    childsCount: 'no childs | {n} child | {n} childs'
    referrersCount: 'no referrers | {n} referrer | {n} referrers'
    error404: Entity not found or you do not have access to it
  et:
    sharingPrivate: Privaatne
    sharingPrivateDescription: Seda objekti saavad vaadata ainult õigustega kasutajad. Sisselogimine on vajalik.
    sharingDomain: Kõik kasutajad
    sharingDomainDescription: Kõik kasutajad saavad vaadata seda objekti. Sisselogimine on vajalik.
    sharingPublic: Objekt on avalik
    sharingPublicDescription: Igaüks Internetis saab vaadata selle objekti avalikke parameetreid. Sisselogimine pole vajalik.
    childsCount: 'alamobjekte pole | {n} alamobjekt | {n} alamobjekti'
    referrersCount: 'viitajaid pole | {n} viitaja | {n} viitajat'
    error404: Objekti ei leitud või sul puudub ligipääs sellele
</i18n>

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
