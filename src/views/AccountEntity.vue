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
    props: ['_thumbnail', 'name.string'],
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

  entity.value = await apiGetEntity(eId)
}

async function onEntitiesScroll (el) {
  if (entitiesList.value.length > entitiesCount.value || isLoading.value || el.srcElement.scrollHeight - (el.srcElement.offsetHeight + el.srcElement.scrollTop) > 100) {
    return
  }

  skip.value += limit.value

  await loadEntities(route.query)
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
