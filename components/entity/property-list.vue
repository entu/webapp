<script setup>
const props = defineProps({
  properties: { type: Array, required: true },
  edit: { type: Boolean, default: false }
})

const visibleProperties = computed(() => props.edit ? props.properties : props.properties.filter(x => x.mandatory || x.values))
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
        :class="{ 'text-red-700' : property.mandatory && (edit || !property.values) }"
      >
        {{
          property.values && property.values.length > 1
            ? (property.labelPlural || property.label || property.name)
            : (property.label || property.name)
        }}
      </div>

      <div class="col-span-2">
        <entity-property-edit
          v-if="edit"
          :decimals="property.decimals"
          :is-multilingual="property.multilingual"
          :type="property.type"
          :values="property.values"
        />
        <entity-property-view
          v-else-if="!edit && property.values"
          :decimals="property.decimals"
          :is-markdown="property.markdown"
          :values="property.values"
        />
      </div>
    </div>
  </div>
</template>
