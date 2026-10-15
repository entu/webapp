<script setup>
const props = defineProps({
  icon: { type: String, required: true },
  label: { type: String, default: undefined }
})

const iconName = computed(() => props.icon.includes(':') ? props.icon : `local:${props.icon}`)
</script>

<template>
  <!-- Decorative unless it has a label: then screen readers read the label in place of the icon -->
  <Icon
    class="print-as-is text-base"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label"
    :name="iconName"
    :role="label ? 'img' : undefined"
  />
</template>

<style>
@reference "tailwindcss";

:deep(svg) {
  @apply m-0;
}
</style>
