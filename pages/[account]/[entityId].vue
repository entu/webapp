<script setup>
import { NCollapse, NCollapseItem } from 'naive-ui'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const userStore = useUserStore()
const { account } = storeToRefs(userStore)
const entity = ref({})
const entityId = ref()
const entityType = ref({})
const entityProps = ref([])
const properties = ref([])
const isLoading = ref(false)

definePageMeta({ layout: 'menu' })
useHead({ title: `${account.value} · Entu` })

watch(() => entity?.value?.name, (value) => {
  if (value) {
    useHead({ title: `${value} · ${account.value} · Entu` })
  } else {
    useHead({ title: `${account.value} · Entu` })
  }
})

async function loadEntity () {
  entity.value = null

  if (!route.params.entityId) return

  const rawEntity = await apiGetEntity(route.params.entityId)
  entityId.value = rawEntity._id

  const typeId = rawEntity._type?.[0]?.reference
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
  }

  entity.value = {
    _id: rawEntity._id,
    _thumbnail: rawEntity._thumbnail,
    name: getValue(rawEntity.name),
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

  for (const property in rawEntity) {
    if (['_id', '_thumbnail'].includes(property)) {
      continue
    }

    const existingProperty = entity.value.props.find(p => p.name === property)

    if (existingProperty) {
      existingProperty.values = rawEntity[property]
    } else {
      entity.value.props.push({ name: property, values: rawEntity[property] })
    }
  }

  const propsObject = {}

  entity.value.props.forEach((property) => {
    const fieldset = property.fieldset?.toLowerCase()
    const group = !fieldset && property.name.startsWith('_') ? 'System properties' : fieldset
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

  properties.value = Object.values(propsObject)

  properties.value.forEach((m) => {
    m.ordinal = m.ordinal / m.children.length
    m.children.sort(propsSorter)
  })

  properties.value.sort(propsSorter)
}

function propsSorter (a, b) {
  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) { return -1 }
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) { return 1 }

  if (!a.ordinal && b.ordinal) { return -1 }
  if (a.ordinal && !b.ordinal) { return 1 }

  if (!a.name || a.name < b.name) { return -1 }
  if (!b.name || a.name > b.name) { return 1 }

  return 0
}

onMounted(() => {
  !account.value && location.reload()

  loadEntity(route.params.entity)
})
</script>

<template>
  <transition>
    <div
      v-if="entity"
      class="p-4 flex-auto flex overflow-y-auto overflow-hidden"
    >
      <div class="flex-auto">
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

          <n-collapse-item
            name="children"
            title="Children entities"
          >
            <div />
          </n-collapse-item>

          <n-collapse-item
            name="referrers"
            title="Referrer entities"
          >
            <div />
          </n-collapse-item>
        </n-collapse>
      </div>

      <img
        v-if="entity._thumbnail"
        class="h-32 w-32 flex-none mt-1 ml-16 object-cover rounded-lg"
        :src="entity._thumbnail"
      >
    </div>
  </transition>
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
