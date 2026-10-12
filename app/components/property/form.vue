<script setup>
const entityId = defineModel('entityId', { type: String, default: undefined })
const entityParentId = defineModel('entityParentId', { type: String, default: undefined })
const entityTypeId = defineModel('entityTypeId', { type: String, default: undefined })
const isUpdating = defineModel('isUpdating', { type: Boolean, default: false })

defineProps({
  entitySharing: { type: String, default: undefined },
  properties: { type: Array, required: true }
})
</script>

<template>
  <div>
    <div
      v-for="property in properties"
      :key="property.name"
      class="grid grid-cols-1 gap-0 pt-3 first-of-type:pt-0 md:grid-cols-3 md:items-center md:gap-4 md:border-t md:border-gray-100 md:pt-0 md:first-of-type:border-t-0"
    >
      <property-label
        class="gap-2 pt-1 pb-0 font-medium md:py-2"
        stacked
        :class="{
          'text-brand': !property.mandatory,
          'text-red-700': property.mandatory,
        }"
        :entity-sharing="entitySharing"
        :property="property"
      />

      <div class="pt-0 pb-1 md:col-span-2 md:py-1">
        <property-edit
          v-model:entity-id="entityId"
          v-model:entity-parent-id="entityParentId"
          v-model:entity-type-id="entityTypeId"
          v-model:is-updating="isUpdating"
          :decimals="property.decimals"
          :disabled="isUpdating"
          :is-list="property.list"
          :is-multilingual="property.multilingual"
          :property="property.name"
          :reference-query="property.referenceQuery"
          :set="property.set?.map(x => x.string)"
          :type="property.type"
          :values="property.values"
        />
      </div>
    </div>
  </div>
</template>
