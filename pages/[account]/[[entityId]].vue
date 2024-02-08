<script setup>
import { NCollapse, NCollapseItem, NPopover } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()

const { accountId } = useAccount()
const { userId } = useUser()

const stats = ref()
const entityId = ref(route.params.entityId)
const newEntityId = ref()
const rawEntity = ref()
const rawEntityType = ref()
const rawChilds = ref([])
const rawReferences = ref([])
const entityProps = ref([])
const isLoading = ref(false)

const typeId = computed(() => getValue(rawEntity.value?._type, 'reference'))

const isQuery = computed(() => Object.keys(route.query).length > 0)

const entity = computed(() => {
  if (!rawEntity.value) return {}

  const result = {
    _id: rawEntity.value._id,
    _thumbnail: rawEntity.value._thumbnail,
    _public: getValue(rawEntity.value._public, 'boolean'),
    name: getValue(rawEntity.value.name),
    type: rawEntityType.value
      ? {
          _id: rawEntityType.value._id,
          name: getValue(rawEntityType.value.name),
          label: getValue(rawEntityType.value.label),
          description: getValue(rawEntityType.value.description)
        }
      : {},
    props: entityProps.value.map(p => ({
      decimals: getValue(p.decimals, 'number'),
      default: getValue(p.default),
      description: getValue(p.description),
      formula: getValue(p.formula),
      group: getValue(p.group),
      hidden: getValue(p.hidden, 'boolean'),
      label: getValue(p.label),
      labelPlural: getValue(p.label_plural),
      list: getValue(p.list, 'boolean'),
      mandatory: getValue(p.mandatory, 'boolean'),
      markdown: getValue(p.markdown, 'boolean'),
      multilingual: getValue(p.multilingual, 'boolean'),
      name: getValue(p.name),
      ordinal: getValue(p.ordinal, 'number'),
      public: getValue(p.public, 'boolean'),
      readonly: getValue(p.readonly, 'boolean'),
      search: getValue(p.search, 'boolean'),
      set: p.set,
      reference_query: getValue(p.reference_query),
      type: getValue(p.type)
    }))
  }

  for (const property in rawEntity.value) {
    if (['_id', '_thumbnail'].includes(property)) continue

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
    if (property.name?.startsWith('_')) return
    if (property.name === 'name') return

    const group = property.name?.startsWith('_') ? '_' : property.group || ''
    const ordinal = property.name?.startsWith('_') ? 99999 : property.ordinal || 0

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
  ...rawChilds.value.map(x => ({
    _id: x._id,
    label: getValue(x.label_plural) || getValue(x.label) || getValue(x.name),
    count: t('childsCount', x._count),
    referenceField: '_parent.reference'
  })),
  ...rawReferences.value.map(x => ({
    _id: x._id,
    label: getValue(x.label_plural) || getValue(x.label) || getValue(x.name),
    count: t('referrersCount', x._count),
    referenceField: '_reference.reference'
  }))
].sort((a, b) => a.label.localeCompare(b.label)))

const right = computed(() => ({
  owner: rawEntity.value?._owner?.some(x => x.reference === userId.value) || false,
  editor: rawEntity.value?._editor?.some(x => x.reference === userId.value) || false,
  expander: rawEntity.value?._expander?.some(x => x.reference === userId.value) || false,
  viewer: rawEntity.value?._viewer?.some(x => x.reference === userId.value) || false
}))

const drawerType = computed(() => route.hash.replace('#', '').split('-').at(0))

const addTypeId = computed(() => route.hash.split('-').at(1))

watch(() => entity?.value?.name, (value) => {
  if (value) {
    useHead({ title: `${value} · ${accountId.value}` })
  } else {
    useHead({ title: accountId.value })
  }
}, { immediate: true })

async function loadEntity () {
  if (!entityId.value) return

  isLoading.value = true

  rawEntity.value = await apiGetEntity(entityId.value)

  if (!rawEntity.value) return showError({ statusCode: 404, statusMessage: t('error404') })

  if (!typeId.value) return

  rawEntityType.value = await apiGetEntity(typeId.value, [
    'description',
    'label',
    'name'
  ])

  const { entities } = await apiGetEntities({
    '_parent.reference': typeId.value,
    props: [
      'decimals',
      'description',
      'group',
      'hidden',
      'label_plural',
      'label',
      'mandatory',
      'markdown',
      'name',
      'ordinal',
      'public',
      'readonly',
      'search',
      'type'
    ]
  })

  entityProps.value = entities

  isLoading.value = false
}

async function loadChilds () {
  const { entities } = await apiGetEntities({
    '_parent.reference': entityId.value,
    group: '_type.reference',
    props: '_type'
  })

  entities.forEach(async (x) => {
    if (!x._type?.reference) return

    const rawType = await apiGetEntity(x._type.reference, [
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
    if (!x._type?.reference) return

    const rawType = await apiGetEntity(x._type.reference, [
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
  } else {
    await navigateTo({ path: route.path, query: route.query, hash: undefined }, { replace: true })

    loadEntity()
  }
}

async function onDelete () {
  await navigateTo({ path: `/${accountId.value}`, query: route.query, hash: undefined }, { replace: true })
}

onMounted(async () => {
  if (entityId.value) {
    loadEntity()
    loadChilds()
    loadReferences()
  } else if (userId.value && !isQuery.value) {
    stats.value = await apiRequest('account')
  }
})
</script>

<template>
  <div class="h-full flex flex-col">
    <entity-toolbar
      :entity-id="entityId"
      :right="right"
      :type-id="typeId"
    />

    <transition>
      <div
        v-if="rawEntity"
        class="px-2 pb-4 flex flex-col overflow-y-auto overflow-hidden"
      >
        <div
          v-if="rawEntity?._parent"
          class="py-4 border-b border-gray-300"
        >
          <entity-parent-list :parents="rawEntity._parent" />
        </div>

        <div class="pt-5 pr-5 flex gap-5">
          <div class="grow">
            <h1 class="mb-4 pl-5 text-2xl text-[#1E434C] font-bold">
              {{ entity.name || entity._id }}
            </h1>

            <n-collapse :default-expanded-names="[0]">
              <template
                v-for="(pg, idx) in properties"
                :key="pg.name"
              >
                <n-collapse-item
                  v-if="pg.name && pg.children && pg.children.some(x => x.mandatory || x.values)"
                  :name="idx"
                  :title="pg.name"
                >
                  <property-list
                    class="pl-5"
                    :properties="pg.children"
                  />
                </n-collapse-item>
                <div v-if="!pg.name && pg.children && pg.children.some(x => x.mandatory || x.values)">
                  <property-list
                    class="pl-5"
                    :properties="pg.children"
                  />
                </div>
              </template>
            </n-collapse>
          </div>

          <div class="min-w-[8rem] flex flex-col gap-3">
            <entity-thumbnail
              v-if="entity._thumbnail"
              class="w-full flex-none"
              :thumbnail="entity._thumbnail"
              :photos="rawEntity.photo"
            />

            <nuxt-link
              v-if="entity.type.label"
              class="py-1 px-2 text-xs text-center bg-slate-50 border rounded-md border-slate-300 hover:bg-slate-200"
              :to="{ path: `/${accountId}/${entity.type._id}` }"
            >
              {{ entity.type.label }}
            </nuxt-link>

            <n-popover
              v-if="entity._public"
              class="max-w-sm"
              placement="left"
            >
              <template #trigger>
                <nuxt-link
                  class="py-1 px-2 flex items-center justify-between gap-1 text-xs text-center text-orange-600 bg-orange-50 border rounded-md border-orange-300"
                  :to="{ path: route.path, query: route.query, hash:'#rights' }"
                >
                  {{ t('public') }}

                  <my-icon icon="public/true" />
                </nuxt-link>
              </template>
              <div class="text-sm">
                {{ t('publicDescription') }}
              </div>
            </n-popover>
          </div>
        </div>

        <n-collapse
          :default-expanded-names="[0]"
          class="mt-8 pr-5"
        >
          <n-collapse-item
            v-for="child in childs"
            :key="child._id"
            :name="child._id + child.count"
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

    <transition>
      <div
        v-if="!isQuery && stats"
        class="size-full lg:w-1/2 xl:w-1/2 md:min-w-fit px-8 md:mx-auto flex flex-col justify-center"
        vertical
      >
        <my-stats-bar
          class="my-3"
          color="rgb(23,162,184)"
          rail-color="rgba(23,162,184,.3)"
          :a-label="t('entities')"
          :b-label="t('deleted')"
          :a-value="stats.entities"
          :b-value="stats.deletedEntities"
        />
        <my-stats-bar
          class="my-3"
          color="rgb(255,193,7)"
          rail-color="rgba(255,193,7,.3)"
          :a-label="t('properties')"
          :b-label="t('deleted')"
          :a-value="stats.properties"
          :b-value="stats.deletedProperties"
        />
        <my-stats-bar
          class="my-3"
          is-bytes
          color="rgb(40,167,69)"
          rail-color="rgba(40,167,69,.3)"
          :a-label="t('files')"
          :b-label="t('deleted')"
          :a-value="stats.filesSize"
          :b-value="stats.deletedFilesSize"
        />
        <my-stats-bar
          class="my-3"
          color="rgb(108,117,125)"
          rail-color="rgba(108,117,125,.3)"
          show-total
          :a-label="t('requests')"
          :b-label="t('limit')"
          :a-value="stats.requestsMonth"
          :b-value="Math.ceil(stats.requestsMonth / Math.pow(10, stats.requestsMonth.toString().length - 1)) * Math.pow(10, stats.requestsMonth.toString().length - 1) - stats.requestsMonth"
        />
      </div>
    </transition>

    <entity-drawer-edit
      v-if="drawerType === 'add'"
      v-model:entity-id="newEntityId"
      :entity-type-id="addTypeId"
      @close="onDrawerClose()"
    />
    <entity-drawer-edit
      v-if="drawerType === 'child'"
      v-model:entity-id="newEntityId"
      :entity-parent-id="entityId"
      :entity-type-id="addTypeId"
      @close="onDrawerClose()"
    />
    <entity-drawer-edit
      v-if="drawerType === 'edit'"
      v-model:entity-id="entityId"
      :can-delete="right.owner"
      @close="onDrawerClose()"
      @delete="onDelete()"
    />
    <entity-drawer-duplicate
      v-if="drawerType === 'duplicate'"
      v-model:entity-id="entityId"
      @close="onDrawerClose()"
    />
    <entity-drawer-parents
      v-if="drawerType === 'parents'"
      v-model:entity-id="entityId"
      @close="onDrawerClose()"
    />
    <entity-drawer-rights
      v-if="drawerType === 'rights'"
      v-model:entity-id="entityId"
      @close="onDrawerClose()"
    />
    <entity-drawer-debug
      v-if="drawerType === 'debug'"
      :entity="entity"
      :properties="properties"
      :raw-entity="rawEntity"
      :raw-type="rawEntityType"
      :raw-properties="entityProps"
      @close="onDrawerClose()"
    />
  </div>
</template>

<i18n lang="yaml">
  en:
    entities: Entities
    properties: Properties
    files: Files
    requests: Requests in this month
    deleted: deleted
    limit: limit
    public: Entity is public
    publicDescription: This entity is visible to anonymous users
    childsCount: 'no childs | {n} child | {n} childs'
    referrersCount: 'no referrers | {n} referrer | {n} referrers'
    error404: Entity not found
  et:
    entities: Objekte
    properties: Parameetreid
    files: Faile
    requests: Päringuid selles kuus
    deleted: kustutatud
    limit: limiit
    public: Objekt on avalik
    publicDescription: Seda objekti näevad ka sisselogimata kasutajad
    childsCount: 'alamobjekte pole | {n} alamobjekt | {n} alamobjekti'
    referrersCount: 'viitajaid pole | {n} viitaja | {n} viitajat'
    error404: Objekti ei leitud
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
