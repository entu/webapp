<script setup>
import { NCollapse, NCollapseItem, NDrawer, NDrawerContent } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()

const { accountId } = useAccount()
const { userId } = useUser()

const stats = ref()
const rawEntity = ref()
const rawEntityType = ref()
const rawChilds = ref([])
const rawReferences = ref([])
const entityProps = ref([])
const isLoading = ref(false)
const drawerTitle = ref('')
const drawerWidth = ref(window.innerWidth / 2)

const entityId = computed(() => route.params.entityId)

const rawEntityId = computed(() => rawEntity.value?._id)

const typeId = computed(() => getValue(rawEntity.value?._type, 'reference'))

const isQuery = computed(() => Object.keys(route.query).length > 0)

const entity = computed(() => {
  if (!rawEntity.value) return {}

  const result = {
    _id: rawEntity.value._id,
    _thumbnail: rawEntity.value._thumbnail,
    name: getValue(rawEntity.value.name),
    type: rawEntityType.value
      ? {
          _id: rawEntityType.value._id,
          name: getValue(rawEntityType.value.name),
          label: getValue(rawEntityType.value.label),
          labelPlural: getValue(rawEntityType.value.label_plural),
          description: getValue(rawEntityType.value.description)
        }
      : {},
    props: entityProps.value.map(p => ({
      classifier: p.classifier,
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
    // if (property.name.startsWith('_')) return

    const group = property.name.startsWith('_') ? '_' : property.group || ''
    const ordinal = property.name.startsWith('_') ? 99999 : property.ordinal || 0

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

const right = computed(() => {
  if (!rawEntity.value) return null
  if (rawEntity.value._owner?.some(x => x.reference === userId.value)) return 'owner'
  if (rawEntity.value._editor?.some(x => x.reference === userId.value)) return 'editor'
  if (rawEntity.value._expander?.some(x => x.reference === userId.value)) return 'expander'
  if (rawEntity.value._viewer?.some(x => x.reference === userId.value)) return 'viewer'

  return null
})

const drawer = computed({
  get: () => !!drawerType.value,
  set: (value) => { !value && closeDrawer() }
})

const drawerType = computed(() => route.hash.replace('#', '').split('-').at(0))

const addTypeId = computed(() => route.hash.split('-').at(1))

watch(() => entity?.value?.name, (value) => {
  if (value) {
    useHead({ title: `${value} · ${accountId.value}` })
  } else {
    useHead({ title: accountId.value })
  }
})

async function loadEntity () {
  if (!entityId.value) return

  isLoading.value = true

  rawEntity.value = await apiGetEntity(entityId.value)

  if (!rawEntity.value) return showError({ statusCode: 404, statusMessage: t('error404') })

  if (!typeId.value) return

  rawEntityType.value = await apiGetEntity(typeId.value, {
    props: [
      'description',
      'label_plural',
      'label',
      'name'
    ]
  })

  const { entities } = await apiGetEntities({
    '_parent.reference': typeId.value,
    props: [
      'classifier',
      'decimals',
      'default',
      'description',
      'formula',
      'group',
      'hidden',
      'label_plural',
      'label',
      'list',
      'mandatory',
      'markdown',
      'multilingual',
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
    const rawType = await apiGetEntity(x._type.reference, {
      props: [
        'label_plural',
        'label',
        'name'
      ].join(',')
    })

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
    const rawType = await apiGetEntity(x._type.reference, {
      props: [
        'label_plural',
        'label',
        'name'
      ].join(',')
    })

    rawReferences.value.push({
      ...rawType,
      _count: x._count
    })
  })
}

function propsSorter (a, b) {
  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) return -1
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) return 1

  if (!a.ordinal && b.ordinal) return -1
  if (a.ordinal && !b.ordinal) return 1

  if (!a.name || a.name < b.name) return -1
  if (!b.name || a.name > b.name) return 1

  return 0
}

async function closeDrawer () {
  await navigateTo({ ...route, hash: null }, { replace: true })
}

onMounted(async () => {
  if (entityId.value) {
    loadEntity()
    loadChilds()
    loadReferences()
  } else {
    stats.value = await apiGet('account')
  }
})
</script>

<template>
  <transition>
    <div class="h-full flex flex-col">
      <entity-toolbar
        :entity-id="rawEntityId"
        :right="right"
        :type-id="typeId"
      />

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
              {{ entity.name }}
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
                  <entity-property-list
                    class="pl-5"
                    :properties="pg.children"
                  />
                </n-collapse-item>
                <div v-if="!pg.name && pg.children && pg.children.some(x => x.mandatory || x.values)">
                  <entity-property-list
                    class="pl-5"
                    :properties="pg.children"
                  />
                </div>
              </template>
            </n-collapse>
          </div>

          <div
            v-if="entity._thumbnail"
            class="w-32 h-32 flex-none flex object-cover"
          >
            <entity-thumbnail
              :thumbnail="entity._thumbnail"
              :photos="rawEntity.photo"
            />
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
              :entity-id="rawEntityId"
              :type-id="child._id"
              :reference-field="child.referenceField"
            />
          </n-collapse-item>
        </n-collapse>
      </div>

      <div
        v-if="!isQuery && stats"
        class="h-full w-full lg:w-1/2 xl:w-1/2 md:min-w-fit px-8 md:mx-auto flex flex-col justify-center"
        vertical
      >
        <stats-bar
          class="my-3"
          color="rgb(23,162,184)"
          rail-color="rgba(23,162,184,.3)"
          :a-label="t('entities')"
          :b-label="t('deleted')"
          :a-value="stats.entities"
          :b-value="stats.deletedEntities"
        />
        <stats-bar
          class="my-3"
          color="rgb(255,193,7)"
          rail-color="rgba(255,193,7,.3)"
          :a-label="t('properties')"
          :b-label="t('deleted')"
          :a-value="stats.properties"
          :b-value="stats.deletedProperties"
        />
        <stats-bar
          class="my-3"
          is-bytes
          color="rgb(40,167,69)"
          rail-color="rgba(40,167,69,.3)"
          :a-label="t('files')"
          :b-label="t('deleted')"
          :a-value="stats.filesSize"
          :b-value="stats.deletedFilesSize"
        />
        <stats-bar
          class="my-3"
          color="rgb(108,117,125)"
          rail-color="rgba(108,117,125,.3)"
          show-total
          :a-label="t('requests')"
          :b-label="t('limit')"
          :a-value="stats.dbSize"
          :b-value="Math.ceil(stats.dbSize / Math.pow(10, stats.dbSize.toString().length - 1)) * Math.pow(10, stats.dbSize.toString().length - 1) - stats.dbSize"
        />
      </div>

      <n-drawer
        v-model:show="drawer"
        placement="right"
        resizable
        :default-width="drawerWidth"
      >
        <n-drawer-content
          :closable="true"
          :title="drawerTitle"
        >
          <entity-drawer-edit
            v-if="drawerType === 'add'"
            :type-id="addTypeId"
            @update:title="(title) => { drawerTitle = title }"
          />
          <entity-drawer-edit
            v-if="drawerType === 'child'"
            :parent-id="rawEntityId"
            :type-id="addTypeId"
            @update:title="(title) => { drawerTitle = title }"
          />
          <entity-drawer-edit
            v-if="drawerType === 'edit'"
            :entity-id="rawEntityId"
            @update:title="(title) => { drawerTitle = title }"
          />
          <entity-drawer-duplicate
            v-if="drawerType === 'duplicate'"
            :entity-id="rawEntityId"
            @update:title="(title) => { drawerTitle = title }"
          />
          <entity-drawer-parents
            v-if="drawerType === 'parents'"
            :entity-id="rawEntityId"
            @update:title="(title) => { drawerTitle = title }"
          />
          <entity-drawer-rights
            v-if="drawerType === 'rights'"
            :entity-id="rawEntityId"
            @update:title="(title) => { drawerTitle = title }"
          />
        </n-drawer-content>
      </n-drawer>
    </div>
  </transition>
</template>

<i18n lang="yaml">
  en:
    entities: Entities
    properties: Properties
    files: Files
    requests: Requests in day
    deleted: deleted
    limit: limit
    childsCount: 'no childs | {n} child | {n} childs'
    referrersCount: 'no referrers | {n} referrer | {n} referrers'
    error404: Entity not found
  et:
    entities: Objekte
    properties: Parameetreid
    files: Faile
    requests: Päringuid päevas
    deleted: kustutatud
    limit: limiit
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