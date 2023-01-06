<script setup>
import { NCollapse, NCollapseItem } from 'naive-ui'
import { useUserStore } from '~/stores/user'

const { n, t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
const { _id: userId, account } = storeToRefs(userStore)
const rawEntity = ref()
const rawChilds = ref([])
const entityType = ref({})
const entityProps = ref([])
const isLoading = ref(false)

definePageMeta({ layout: 'menu' })

const entityId = computed(() => route.params.entityId)

const entity = computed(() => {
  if (!rawEntity.value) return {}

  const result = {
    _id: rawEntity.value._id,
    _thumbnail: rawEntity.value._thumbnail,
    name: getValue(rawEntity.value.name),
    type: {
      _id: entityType.value._id,
      name: getValue(entityType.value.name),
      label: getValue(entityType.value.label),
      labelPlural: getValue(entityType.value.label_plural),
      description: getValue(entityType.value.description),
      openAfterAdd: getValue(entityType.value.open_after_add, 'boolean'),
      defaultParent: entityType.value.default_parent,
      optionalParent: entityType.value.optional_parent,
      addFromMenu: entityType.value.add_from_menu,
      allowedChild: entityType.value.allowed_child
    },
    props: entityProps.value.map(p => ({
      type: getValue(p.type),
      name: getValue(p.name),
      label: getValue(p.label),
      labelPlural: getValue(p.label_plural),
      description: getValue(p.description),
      group: getValue(p.group),
      default: getValue(p.default),
      formula: getValue(p.formula),
      classifier: p.classifier,
      ordinal: getValue(p.ordinal, 'integer'),
      list: getValue(p.list, 'boolean'),
      multilingual: getValue(p.multilingual, 'boolean'),
      hidden: getValue(p.hidden, 'boolean'),
      readonly: getValue(p.readonly, 'boolean'),
      mandatory: getValue(p.mandatory, 'boolean'),
      public: getValue(p.public, 'boolean'),
      search: getValue(p.search, 'boolean')
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
    const group = (property.group && !property.name.startsWith('_')) ? property.group : t('system')
    const ordinal = property.ordinal?.[0]?.integer || 0

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
    m.ordinal = m.ordinal / m.children.length
    m.children.sort(propsSorter)
  })

  result.sort(propsSorter)

  return result
})

const right = computed(() => {
  if (!rawEntity.value) return null
  if (rawEntity.value._owner?.some(x => x.reference === userId.value)) return 'owner'
  if (rawEntity.value._editor?.some(x => x.reference === userId.value)) return 'editor'
  if (rawEntity.value._expander?.some(x => x.reference === userId.value)) return 'expander'
  if (rawEntity.value._viewer?.some(x => x.reference === userId.value)) return 'viewer'
  return null
})

watch(() => entity?.value?.name, (value) => {
  if (value) {
    useHead({ title: `${value} · ${account.value}` })
  } else {
    useHead({ title: account.value })
  }
})

async function loadEntity () {
  isLoading.value = true

  if (!entityId) return

  rawEntity.value = await apiGetEntity(entityId.value)

  const typeId = rawEntity.value._type?.[0]?.reference
  if (typeId) {
    entityType.value = await apiGetEntity(typeId, {
      props: [
        'add_from_menu',
        'allowed_child',
        'default_parent',
        'description',
        'label_plural',
        'label',
        'name',
        'open_after_add',
        'optional_parent'
      ]
    })

    const props = await apiGetEntities({
      '_parent.reference': typeId,
      props: [
        'classifier',
        'default',
        'description',
        'group',
        'formula',
        'hidden',
        'label_plural',
        'label',
        'list',
        'mandatory',
        'multilingual',
        'name',
        'ordinal',
        'public',
        'readonly',
        'search',
        'type'
      ]
    })

    entityProps.value = props.entities

    isLoading.value = false
  }
}

async function loadChilds () {
  const { entities } = await apiGetEntities({
    '_parent.reference': entityId.value,
    group: '_type.string',
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

function propsSorter (a, b) {
  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) return -1
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) return 1

  if (!a.ordinal && b.ordinal) return -1
  if (a.ordinal && !b.ordinal) return 1

  if (!a.name || a.name < b.name) return -1
  if (!b.name || a.name > b.name) return 1

  return 0
}

onMounted(() => {
  loadEntity()
  loadChilds()
})
</script>

<template>
  <transition>
    <div
      v-if="rawEntity"
      class="h-full flex flex-col"
    >
      <div class="h-12">
        <tools-menu :right="right" />
      </div>

      <div class="px-2 pb-4 flex flex-col overflow-y-auto overflow-hidden">
        <div
          v-if="rawEntity?._parent"
          class="py-4 border-b border-gray-300"
        >
          <entity-parents
            :account="account"
            :parents="rawEntity._parent"
          />
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
                  <entity-properties
                    class="pl-5"
                    :properties="pg.children"
                  />
                </n-collapse-item>
                <div v-if="!pg.name && pg.children && pg.children.some(x => x.mandatory || x.values)">
                  <entity-properties
                    class="pl-5"
                    :properties="pg.children"
                  />
                </div>
              </template>
            </n-collapse>
          </div>

          <img
            v-if="entity._thumbnail"
            class="h-32 w-32 flex-none object-cover rounded-lg"
            :src="entity._thumbnail"
          >
        </div>

        <n-collapse
          :default-expanded-names="[0]"
          class="mt-8 pr-5"
        >
          <n-collapse-item
            v-for="child in rawChilds"
            :key="child._id"
            :name="child._id"
            :title="t('childrens', { label: getValue(child.label_plural) || getValue(child.label) || getValue(child.name) })"
          >
            <template #header-extra>
              <span class="text-gray-400">{{ n(child._count) }}</span>
            </template>
            <entity-childs
              class="w-full pl-5"
              :account="account"
              :entity-id="entityId"
              :type-id="child._id"
            />
          </n-collapse-item>

          <n-collapse-item
            name="referrers"
            :title="t('referrers')"
          >
            <div />
          </n-collapse-item>
        </n-collapse>
      </div>
    </div>
  </transition>
</template>

<i18n lang="yaml">
  en:
    system: System properties
    childrens: Children entities - {label}
    referrers: Referrer entities
  et:
    system: Süsteemi parameetrid
    childrens: Alamobjektid - {label}
    referrers: Viitavad objektid
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
