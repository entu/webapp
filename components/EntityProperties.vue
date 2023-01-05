<script setup>
const props = defineProps({
  properties: { type: Array, default: null }
})

const visibleProperties = computed(() => props.properties.filter(x => x.mandatory || x.values))
</script>

<template>
  <div>
    <div
      v-for="property in visibleProperties"
      :key="property.name"
      class="grid grid-cols-3 gap-3 border-t first-of-type:border-t-0 border-gray-100"
    >
      <div
        class="py-1 text-right text-[#1E434C] font-medium"
        :class="{ 'text-red-700' : property.mandatory && !property.values }"
      >
        {{ property.label || property.name }}
      </div>
      <!-- <pre class="text-xs">{{ property }}</pre> -->
      <div class="col-span-2">
        <property-view
          :values="property.values"
        />
      </div>
    </div>
  </div>
</template>
