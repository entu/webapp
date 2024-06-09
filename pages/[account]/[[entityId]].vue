<script setup>
import { hide, update } from '@intercom/messenger-js-sdk'
import { NCollapse, NCollapseItem, NPopover, NSpin } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const { accountId } = useAccount()
const { userId } = useUser()

const entityTypeStore = useEntityTypeStore()
const { entityTypes } = storeToRefs(entityTypeStore)

const stats = ref()
const entityId = ref(route.params.entityId)
const newEntityId = ref()
const rawEntity = ref()
const rawChilds = ref([])
const rawReferences = ref([])
const isLoading = ref(false)

const typeId = computed(() => getValue(rawEntity.value?._type, 'reference'))
const typeName = computed(() => getValue(rawEntity.value?._type, 'string'))

const isQuery = computed(() => Object.keys(route.query).length > 0)

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
    type: 'child',
    label: getValue(x.label_plural) || getValue(x.label) || getValue(x.name),
    count: t('childsCount', x._count),
    referenceField: '_parent.reference'
  })),
  ...rawReferences.value.map(x => ({
    _id: x._id,
    type: 'reference',
    label: getValue(x.label_plural) || getValue(x.label) || getValue(x.name),
    count: t('referrersCount', x._count),
    referenceField: '_reference.reference'
  }))
].sort((a, b) => `${a.type} - ${a.label}`.localeCompare(`${b.type} - ${b.label}`)))

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

watch(drawerType, (value) => {
  if (value) {
    hide()
    update({ hide_default_launcher: true })
  } else {
    update({ hide_default_launcher: false })
  }
})

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

onMounted(async () => {
  isLoading.value = true

  if (entityId.value) {
    loadEntity()
    loadChilds()
    loadReferences()
  } else if (userId.value && !isQuery.value) {
    stats.value = await apiRequest()
  }

  isLoading.value = false
})
</script>

<template>
  <div class="relative h-full flex flex-col">
    <entity-toolbar
      :entity-id="entityId"
      :right="right"
      :type-id="typeId"
      :type-name="typeName"
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
              {{ entity.name?.trim() || entity._id }}
            </h1>

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
                v-if="pg.children && pg.children.some(x => x.mandatory || x.values)"
                class="pl-5"
                :properties="pg.children"
              />
            </template>
          </div>

          <div
            v-if="userId || entity._thumbnail"
            class="min-w-[8rem] flex flex-col gap-3"
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
                class="py-1 px-2 text-xs text-center bg-slate-50 border rounded-md border-slate-300 hover:bg-slate-200"
                :to="{ path: `/${accountId}/${entity.type._id}` }"
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
                    class="py-1 px-2 flex items-center justify-center gap-1 text-xs text-center text-green-600 bg-green-50 border rounded-md border-green-300"
                    :to="right.owner ? { path: route.path, query: route.query, hash:'#rights' } : {}"
                  >
                    <my-icon icon="sharing/private" />

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
                    class="py-1 px-2 flex items-center justify-center gap-1 text-xs text-center text-yellow-600 bg-yellow-50 border rounded-md border-yellow-300"
                    :to="right.owner ? { path: route.path, query: route.query, hash:'#rights' } : {}"
                  >
                    <my-icon icon="sharing/domain" />

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
                    class="py-1 px-2 flex items-center justify-center gap-1 text-xs text-center text-orange-600 bg-orange-50 border rounded-md border-orange-300"
                    :to="right.owner ? { path: route.path, query: route.query, hash:'#rights' } : {}"
                  >
                    <my-icon icon="sharing/public" />

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
      class="size-full flex items-center justify-center"
    >
      <n-spin />
    </div>

    <transition>
      <div
        v-if="!isQuery && stats"
        class="size-full lg:w-1/2 xl:w-1/2 md:min-w-fit px-8 md:mx-auto flex flex-col justify-center"
        vertical
      >
        <my-stats-bar
          class="my-3"
          color="rgb(23,162,184)"
          deleted-color="rgba(23,162,184,.3)"
          :label="t('entities')"
          :usage="stats.entities.usage"
          :deleted="stats.entities.deleted"
          :limit="stats.entities.limit"
        />
        <my-stats-bar
          class="my-3"
          color="rgb(255,193,7)"
          deleted-color="rgba(255,193,7,.3)"
          :label="t('properties')"
          :usage="stats.properties.usage"
          :deleted="stats.properties.deleted"
        />
        <my-stats-bar
          class="my-3"
          is-bytes
          color="rgb(40,167,69)"
          deleted-color="rgba(40,167,69,.3)"
          :label="t('files')"
          :usage="stats.files.usage"
          :deleted="stats.files.deleted"
          :limit="stats.files.limit"
        />
        <my-stats-bar
          class="my-3"
          color="rgb(108,117,125)"
          deleted-color="rgba(108,117,125,.3)"
          show-total
          :label="t('requests')"
          :usage="stats.requests.usage"
          :limit="stats.requests.limit"
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
      @delete="router.back()"
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
      @close="onDrawerClose()"
    />

    <div
      v-if="!isQuery && !entityId"
      class="absolute bottom-0 right-0 left-0 text-sm text-center text-gray-500"
    >
      <a
        target="_blank"
        :href="t('termsUrl')"
      >{{ t('terms') }}</a>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    entities: Entities
    properties: Properties
    files: Files
    requests: Requests in this month
    sharingPrivate: Private
    sharingPrivateDescription: Only authorized users (below) can view this entity. Login is required.
    sharingDomain: Anyone with account
    sharingDomainDescription: All signed in users can view this entity. Login is required.
    sharingPublic: Public on the web
    sharingPublicDescription: Anyone on the Internet can view the public parameters of this entity. No login required.
    childsCount: 'no childs | {n} child | {n} childs'
    referrersCount: 'no referrers | {n} referrer | {n} referrers'
    error404: Entity not found or you do not have access to it
    terms: Terms of Service
    termsUrl: https://www.entu.app/terms
  et:
    entities: Objekte
    properties: Parameetreid
    files: Faile
    requests: Päringuid selles kuus
    sharingPrivate: Privaatne
    sharingPrivateDescription: Seda objekti saavad vaadata ainult õigustega kasutajad. Sisselogimine on vajalik.
    sharingDomain: Kõik kasutajad
    sharingDomainDescription: Kõik kasutajad saavad vaadata seda objekti. Sisselogimine on vajalik.
    sharingPublic: Objekt on avalik
    sharingPublicDescription: Igaüks Internetis saab vaadata selle objekti avalikke parameetreid. Sisselogimine pole vajalik.
    childsCount: 'alamobjekte pole | {n} alamobjekt | {n} alamobjekti'
    referrersCount: 'viitajaid pole | {n} viitaja | {n} viitajat'
    error404: Objekti ei leitud või sul puudub ligipääs sellele
    terms: Kasutustingimused
    termsUrl: https://www.entu.app/et/tingimused
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
