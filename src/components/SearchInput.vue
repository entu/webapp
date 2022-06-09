<script setup>
import { computed, defineEmits, defineProps } from 'vue'
import { Search as SearchIcon } from '@vicons/carbon'

let debounce

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const searchText = computed({
  get () {
    return props.modelValue
  },
  set (val) {
    clearTimeout(debounce)
    debounce = setTimeout(() => { emit('update:modelValue', val) }, 500)
  }
})
</script>

<template>
  <div class="w-80 flex items-center">
    <label
      for="search"
      class="p-3"
    >
      <search-icon class="h-5 w-5 text-slate-400" />
    </label>
    <input
      id="search"
      v-model="searchText"
      placeholder="Search Entity"
      class="w-full py-3 pr-3 bg-transparent placeholder:italic placeholder:text-slate-400 focus:outline-none"
    >
  </div>
</template>
