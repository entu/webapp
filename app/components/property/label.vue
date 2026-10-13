<script setup>
const props = defineProps({
  property: { type: Object, required: true }
})

const label = computed(() => props.property.values?.length > 1
  ? props.property.labelPlural || props.property.label || props.property.name
  : props.property.label || props.property.name)
</script>

<template>
  <div class="flex">
    <span class="truncate">{{ label }}</span>
  </div>
</template>
