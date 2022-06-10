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
  <div class="overflow-y-auto border-r border-slate-300">
    <router-link
      v-for="entity in entities"
      :key="entity._id"
      class="h-12 mx-2 flex gap-2 items-center border-b border-slate-200"
      :to="{ name: 'entity', params: { ...route.params, entity: entity._id }, query: route.query }"
    >
      <img
        v-if="entity._thumbnail"
        :src="entity._thumbnail"
        class="w-9 h-9 object-cover rounded-full"
        alt="Entity thumbnail"
      >
      <div class="truncate whitespace-nowrap overflow-hidden ">
        {{ getValue(entity.name) }}
      </div>
    </router-link>
  </div>
</template>
