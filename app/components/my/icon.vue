<script setup>
const props = defineProps({
  icon: { type: String, required: true }
})

const iconName = computed(() => props.icon.includes(':') ? props.icon : `local:${props.icon}`)
</script>

<template>
  <Icon
    class="print-as-is text-base"
    :name="iconName"
  />
</template>

<style>
@reference "tailwindcss";

:deep(svg) {
  @apply m-0;
}
</style>
