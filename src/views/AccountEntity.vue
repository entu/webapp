<script setup>
import { watch, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useStore } from '@/store'
import { apiGetEntities } from '@/api'
import EntityList from '@/components/EntityList.vue'

const route = useRoute()
const store = useStore()
const entities = ref([])

onMounted(() => {
  store.account = route.params.account
  loadEntities(route.query)
})

watch(() => route.query, (value) => {
  loadEntities(value)
})

async function loadEntities (query) {
  if (Object.keys(query).length === 0) {
    entities.value = null
    return
  }

  entities.value = await apiGetEntities({ ...query, props: ['name.string'] })
}
</script>

<template>
  <entity-list :entities="entities" />
</template>
