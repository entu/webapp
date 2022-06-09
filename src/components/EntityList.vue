<script setup>
import { defineProps } from 'vue'
import { useRoute } from 'vue-router'

import { getValue } from '@/api'

const route = useRoute()
defineProps({
  entities: {
    type: Array,
    default: null
  }
})
</script>

<template>
  <div class="w-80 overflow-y-auto border-r border-slate-300">
    <router-link
      v-for="entity in entities"
      :key="entity._id"
      class="h-12 px-2 flex items-center border-b border-slate-100"
      :to="{ name: 'entity', params: { ...route.params, entity: entity._id }, query: route.query }"
    >
      <div class="truncate whitespace-nowrap overflow-hidden ">
        {{ getValue(entity.name) }}
      </div>
    </router-link>
  </div>
</template>
