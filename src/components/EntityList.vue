<script setup>
import { defineEmits, defineProps } from 'vue'
import { useRoute } from 'vue-router'

import { getValue } from '@/api'

const route = useRoute()

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  entities: {
    type: Array,
    default: null
  },
  count: {
    type: Number,
    default: null
  }
})

</script>

<template>
  <div class="relative overflow-y-auto border-r border-gray-300">
    <div class="py-2 sticky top-0 text-center text-sm text-gray-500 italic bg-white">
      {{ count }} {{ count === 1 ? 'entity' : 'entities' }}
    </div>
    <router-link
      v-for="(entity, idx) in entities"
      :key="entity._id"
      class="h-12 px-3 flex items-center hover:bg-gray-50"
      :class="{ 'font-bold bg-zinc-100 hover:bg-zinc-100': props.modelValue === entity._id }"
      :to="{ name: 'entity', params: { ...route.params, entity: entity._id }, query: route.query }"
      @click="emit('update:modelValue', entity._id)"
    >
      <img
        v-if="entity._thumbnail"
        :src="entity._thumbnail"
        :class="entity.color"
        class="w-7 h-7 flex-none object-cover rounded-full"
      >
      <div
        v-else
        class="w-7 h-7 flex-none rounded-full "
        :class="entity.color"
      />
      <div
        :class="{ 'border-t': idx === 0 }"
        class="py-3 ml-3 h-12 flex-auto truncate whitespace-nowrap overflow-hidden border-b first-of-type border-gray-200"
      >
        {{ getValue(entity.name) }}
      </div>
    </router-link>
  </div>
</template>
