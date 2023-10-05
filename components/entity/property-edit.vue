<script setup>
const props = defineProps({
  type: { type: String, default: undefined },
  decimals: { type: Number, default: undefined },
  isMultilingual: { type: Boolean, default: false },
  values: { type: Array, default: () => [] }
})
</script>

<template>
  <pre class="text-xs">{{ props }}</pre>
</template>
