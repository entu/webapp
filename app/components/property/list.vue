<script setup>
const props = defineProps({
  entitySharing: { type: String, default: undefined },
  properties: { type: Array, required: true }
})

const visibleProperties = computed(() => props.properties.filter((x) => x.mandatory || x.values))
</script>

<template>
  <div>
    <div
      v-for="property in visibleProperties"
      :key="property.name"
      class="grid grid-cols-1 border-t border-slate-200 py-1 first-of-type:border-t-0 md:grid-cols-[140px_1fr] md:gap-4 dark:border-slate-800"
    >
      <property-label
        class="items-center gap-1 pt-1 md:pt-0.5"
        :class="{
          'text-slate-600 dark:text-slate-300': !property.mandatory || property.values,
          'text-red-600 dark:text-red-400': property.mandatory && !property.values,
        }"
        :entity-sharing="entitySharing"
        :property="property"
      />

      <div class="text-slate-900 dark:text-slate-100">
        <property-view
          v-if="property.values"
          :decimals="property.decimals"
          :is-markdown="property.markdown"
          :values="property.values"
        />
      </div>
    </div>
  </div>
</template>
