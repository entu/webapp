<script setup>
const props = defineProps({
  property: { type: Object, required: true },
  entitySharing: { type: String, default: undefined },
  stacked: { type: Boolean, default: false }
})

const label = computed(() => props.property.values?.length > 1
  ? props.property.labelPlural || props.property.label || props.property.name
  : props.property.label || props.property.name)
</script>

<template>
  <div class="flex justify-start md:justify-end md:text-right">
    <span class="truncate">{{ label }}</span>

    <property-hints
      v-if="stacked"
      class="mt-1.5 w-2.5 flex-col gap-0.5 has-[>:nth-child(2)]:-my-0.5!"
      :entity-sharing="entitySharing"
      :property="property"
    />
  </div>
</template>
