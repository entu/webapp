<script setup>
import { watch, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useStore } from '@/store'
import { apiGetEntity, apiGetEntities } from '@/api'
import EntityList from '@/components/EntityList.vue'

const route = useRoute()
const store = useStore()

const entities = ref([])
const entity = ref([])
const query = ref()

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

  loadEntities(value)
  query.value = location.search
})

watch(() => route.params.entity, (value) => {
  loadEntity(value)
})

async function loadEntities (query) {
  if (Object.keys(query).length === 0) {
    entities.value = null
    return
  }

  entities.value = await apiGetEntities({ ...query, props: ['name.string'] })
}

async function loadEntity (eId) {
  if (!eId || eId === '_') {
    entity.value = null
    return
  }

  entity.value = await apiGetEntity(eId)
}
</script>

<template>
  <entity-list
    class="w-80"
    :entities="entities"
  />
  <div class="grow overflow-y-auto">
    <pre class=" p-4 text-xs ">{{ entity }}</pre>
  </div>
</template>
