<script setup>
const props = defineProps({
  account: { type: String, required: true },
  language: { type: String, required: true },
  properties: { type: Array, required: true }
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
        {{ property.values && property.values.length > 1 ? (property.labelPlural || property.label || property.name) : (property.label || property.name) }}
      </div>
      <!-- <pre class="text-xs">{{ property }}</pre> -->
      <div class="col-span-2">
        <entity-property-view
          v-if="property.values"
          :account="account"
          :decimals="property.decimals"
          :language="language"
          :values="property.values"
          :is-markdown="property.markdown"
        />
      </div>
    </div>
  </div>
</template>
