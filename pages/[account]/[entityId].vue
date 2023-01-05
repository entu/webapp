<script setup>
import { NCollapse, NCollapseItem } from 'naive-ui'
import { useUserStore } from '~/stores/user'

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
const { _id: userId, account } = storeToRefs(userStore)
const rawEntity = ref()
const rawChilds = ref()
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
      fieldset: getValue(p.fieldset),
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
    const fieldset = property.fieldset?.toLowerCase()
    const group = !fieldset && property.name.startsWith('_') ? t('system') : fieldset
    const ordinal = property.ordinal?.[0]?.integer || 0

    if (!propsObject[group]) {
      propsObject[group] = {
        name: property.fieldset || group,
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
        'fieldset',
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

  rawChilds.value = entities
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

        <div class="pt-4 flex gap-4">
          <div class="grow">
            <h1 class="mb-4 text-2xl text-[#1E434C] font-bold">
              {{ entity.name }}
            </h1>
            <n-collapse :default-expanded-names="[0]">
              <template v-for="(pg, idx) in properties" :key="pg.name">
                <n-collapse-item
                  v-if="pg.name"
                  :name="idx"
                  :title="pg.name"
                >
                  <entity-properties :properties="pg.children" />
                </n-collapse-item>
                <div v-else>
                  <entity-properties :properties="pg.children" />
                </div>
              </template>

              <template v-if="rawChilds && rawChilds.length">
                <entity-childs
                  v-for="child in rawChilds"
                  :key="child._type.reference"
                  class="mt-6 first-of-type:mt-0 ml-6"
                  :account="account"
                  :entity-id="entityId"
                  :type-id="child._type.reference"
                />
              </template>

              <n-collapse-item
                name="referrers"
                :title="t('referrers')"
              >
                <div />
              </n-collapse-item>
            </n-collapse>
          </div>

          <img
            v-if="entity._thumbnail"
            class="h-32 w-32 flex-none object-cover rounded-lg"
            :src="entity._thumbnail"
          >
        </div>
      </div>
    </div>
  </transition>
</template>

<i18n lang="yaml">
  en:
    system: System properties
    referrers: Referrer entities
  et:
    system: Süsteemi parameetrid
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
