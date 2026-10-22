<script setup>
const entityId = defineModel('entityId', { type: String, default: undefined })
const entityParentIds = defineModel('entityParentIds', { type: Array, default: () => [] })
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
      class="grid grid-cols-[1fr_auto] items-start gap-x-2 pt-3 first-of-type:pt-0 md:grid-cols-[1fr_2fr_auto] md:gap-x-4 md:border-t md:border-slate-200 md:pt-0 md:first-of-type:border-t-0 md:dark:border-slate-800"
    >
      <property-label
        class="pt-1 pb-0 font-medium md:justify-end md:py-2 md:text-right"
        :class="{
          'text-slate-600 dark:text-slate-300': !property.mandatory,
          'text-red-600 dark:text-red-400': property.mandatory,
        }"
        :property="property"
      />

      <!-- On the label's line on mobile, after the field from md up -->
      <property-hints
        class="gap-1 pt-2 opacity-60 hover:opacity-100 md:order-last md:pt-3.5"
        :entity-sharing="entitySharing"
        :property="property"
      />

      <property-edit
        v-model:entity-id="entityId"
        v-model:entity-parent-ids="entityParentIds"
        v-model:entity-type-id="entityTypeId"
        v-model:is-updating="isUpdating"
        class="col-span-2 min-w-0 pt-0 pb-1 md:col-span-1 md:py-1"
        :decimals="property.decimals"
        :disabled="isUpdating"
        :is-list="property.list"
        :is-multilingual="property.multilingual"
        :label="property.label || property.name"
        :property="property.name"
        :reference-query="property.referenceQuery"
        :set="property.set?.map(x => x.string)"
        :type="property.type"
        :values="property.values"
      />
    </div>
  </div>
</template>
