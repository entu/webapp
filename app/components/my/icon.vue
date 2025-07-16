<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const props = defineProps({
  icon: { type: String, required: true }
})

const iconName = computed(() => props.icon.includes(':') ? props.icon : `local:${props.icon}`)
</script>

<template>
  <Icon
    class="text-base"
    :name="iconName"
  />
</template>

<style>
:deep(svg) {
  @apply m-0;
}
</style>
