<script setup>
import { computed, watch, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NCollapse, NCollapseItem } from 'naive-ui'

import { useStore } from '@/store'
import { apiGetEntity, apiGetEntities, getValue } from '@/api'
import EntityList from '@/components/EntityList.vue'

const route = useRoute()
const store = useStore()

const colors = ['bg-amber-50', 'bg-blue-50', 'bg-cyan-50', 'bg-emerald-50', 'bg-fuchsia-50', 'bg-gray-50', 'bg-green-50', 'bg-indigo-50', 'bg-lime-50', 'bg-neutral-50', 'bg-orange-50', 'bg-pink-50', 'bg-purple-50', 'bg-red-50', 'bg-rose-50', 'bg-sky-50', 'bg-slate-50', 'bg-stone-50', 'bg-teal-50', 'bg-violet-50', 'bg-yellow-50', 'bg-zinc-50'
]
const entitiesList = ref(null)
const entitiesCount = ref(0)
const limit = ref(Math.ceil(window.innerHeight / 50))
const skip = ref(0)
const entity = ref({})
const entityId = ref()
const entityType = ref({})
const entityProps = ref([])
const properties = ref([])
const query = ref()
const isLoading = ref(false)

onMounted(() => {
  store.account = route.params.account
  query.value = location.search

  loadEntities(route.query)
  loadEntity(route.params.entity)
})

const isQuery = computed(() => Object.keys(route.query).length > 0)

watch(() => route.query, (value) => {
  if (query.value === location.search) {
    return
  }

  entitiesList.value = null
  skip.value = 0
  loadEntities(value)
  query.value = location.search
})

watch(() => route.params.entity, (value) => {
  loadEntity(value)
})

async function loadEntities (query) {
  if (Object.keys(query).length === 0) {
    entitiesList.value = null
    return
  }

  isLoading.value = true

  const { entities, count } = await apiGetEntities({
    ...query,
    props: [
      '_thumbnail', 'name.string'
    ],
    limit: limit.value,
    skip: skip.value
  })

  entitiesList.value = [...entitiesList.value || [], ...entities.map(e => ({ ...e, color: color() }))]
  entitiesCount.value = count
  isLoading.value = false
}

async function loadEntity (eId) {
  entity.value = null

  if (!eId || eId === '_') {
    return
  }

  const rawEntity = await apiGetEntity(eId)
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

  entity.value.props.forEach(property => {
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

  properties.value.forEach(m => {
    m.ordinal = m.ordinal / m.children.length
    m.children.sort(propsSorter)
  })

  properties.value.sort(propsSorter)
}

async function onEntitiesScroll (el) {
  if (isLoading.value || entitiesList.value.length >= entitiesCount.value || el.srcElement.scrollHeight - (el.srcElement.offsetHeight + el.srcElement.scrollTop) > 100) {
    return
  }

  skip.value += limit.value

  loadEntities(route.query)
}

function color () {
  const rnd = Math.floor(Math.random() * 21)
  return colors[rnd]
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
</script>

<template>
  <entity-list
    v-if="isQuery"
    v-model="entityId"
    class="w-80 flex-none"
    :entities="entitiesList"
    :count="entitiesCount"
    @scroll="onEntitiesScroll"
  />
  <transition>
    <div
      v-if="entity"
      class="p-4 flex-auto flex overflow-y-auto overflow-hidden"
    >
      <div class="flex-auto">
        <h1 class="mb-4 text-2xl text-[#1E434C] font-bold">
          {{ entity.name }}
        </h1>
        <!-- <n-collapse :default-expanded-names="Array.from(Array(properties.length).keys())"> -->
        <n-collapse :default-expanded-names="[0]">
          <n-collapse-item
            v-for="(pg, idx) in properties"
            :key="pg.name"
            :name="idx"
            :title="pg.name"
          >
            <div
              v-for="(p, pidx) in pg.children"
              :key="p.name"
              class="grid grid-cols-3 gap-3 border-t border-gray-100"
              :class="{'border-t-0': pidx === 0 }"
            >
              <div class="py-1 text-right text-[#1E434C] font-medium uppercase">
                {{ p.label || p.name }}
              </div>
              <div class="col-span-2">
                <div
                  v-for="v in p.values"
                  :key="v._id"
                  class="my-1"
                >
                  {{ v.string }}
                </div>
              </div>
            </div>
          </n-collapse-item>
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
