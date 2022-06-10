<script setup>
import { watch, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useStore } from '@/store'
import { apiGetEntity, apiGetEntities, getValue } from '@/api'
import EntityList from '@/components/EntityList.vue'

const route = useRoute()
const store = useStore()

const entitiesList = ref([])
const entitiesCount = ref(0)
const limit = ref(Math.ceil(window.innerHeight / 50))
const skip = ref(0)
const entity = ref({})
const entityType = ref({})
const query = ref()
const isLoading = ref(false)

onMounted(() => {
  store.account = route.params.account
  query.value = location.search

  loadEntities(route.query)
  loadEntity(route.params.entity)
})

watch(() => route.query, (value) => {
  if (query.value === location.search) {
    return
  }

  entitiesList.value = []
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

  entitiesList.value = [...entitiesList.value, ...entities]
  entitiesCount.value = count
  isLoading.value = false
}

async function loadEntity (eId) {
  entity.value = null

  if (!eId || eId === '_') {
    return
  }

  const rawEntity = await apiGetEntity(eId)

  const typeId = rawEntity._type?.[0]?.reference
  if (typeId) {
    const type = await apiGetEntity(typeId, {
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

    entity.value = {
      _id: rawEntity._id,
      type: {
        _id: type._id,
        name: getValue(type.name, 'string'),
        label: getValue(type.label, 'string'),
        labelPlural: getValue(type.label_plural, 'string'),
        description: getValue(type.description, 'string'),
        openAfterAdd: getValue(type.open_after_add, 'boolean'),
        defaultParent: type.default_parent,
        optionalParent: type.optional_parent,
        addFromMenu: type.add_from_menu,
        allowedChild: type.allowed_child
      },
      props: props.entities.map(p => ({
        type: getValue(p.type, 'string'),
        name: getValue(p.name, 'string'),
        label: getValue(p.label, 'string'),
        labelPlural: getValue(p.label_plural, 'string'),
        description: getValue(p.description, 'string'),
        fieldset: getValue(p.fieldset, 'string'),
        default: getValue(p.default, 'string'),
        formula: getValue(p.formula, 'string'),
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
      const existingProperty = entity.value.props.find(p => p.name === property)

      if (existingProperty) {
        existingProperty.values = rawEntity[property]
      } else {
        entity.value.props.push({ name: property, values: rawEntity[property] })
      }
    }
  }
}

async function onEntitiesScroll (el) {
  if (isLoading.value || entitiesList.value.length >= entitiesCount.value || el.srcElement.scrollHeight - (el.srcElement.offsetHeight + el.srcElement.scrollTop) > 100) {
    return
  }

  skip.value += limit.value

  loadEntities(route.query)
}
</script>

<template>
  <entity-list
    class="w-80"
    :entities="entitiesList"
    @scroll="onEntitiesScroll"
  />
  <transition>
    <div
      v-if="entity"
      class="p-4 grow overflow-y-auto overflow-hidden"
    >
      <img
        v-if="entity._thumbnail"
        class="h-32 w-32 mt-1 object-cover float-right rounded-lg"
        :src="entity._thumbnail"
        alt="Entity thumbnail"
      >
      <h1 class="mb-4 text-2xl font-bold">
        {{ getValue(entity.name) }}
      </h1>
      <pre class="text-xs max-w-0">{{ entity }}</pre>
      <pre class="text-xs max-w-0">{{ entityType }}</pre>
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
