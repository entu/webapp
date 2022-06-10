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
  <div class="overflow-y-auto border-r border-gray-300">
    <router-link
      v-for="entity in entities"
      :key="entity._id"
      class="h-12 mx-3 flex gap-2 items-center "
      :to="{ name: 'entity', params: { ...route.params, entity: entity._id }, query: route.query }"
    >
      <img
        v-if="entity._thumbnail"
        :src="entity._thumbnail"
        class="w-7 h-7 flex-none object-cover rounded-full"
        alt="Entity thumbnail"
      >
      <div
        v-else
        class="w-7 h-7 flex-none block rounded-full "
        :class="entity.color"
      />
      <div class="py-3 h-12 flex-auto truncate whitespace-nowrap overflow-hidden border-b border-gray-200">
        {{ getValue(entity.name) }}
      </div>
    </router-link>
  </div>
</template>
