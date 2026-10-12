<script setup>
import { NButtonGroup } from 'naive-ui'

defineProps({
  // Button groups for an auth page; each button is { id, icon, label, onClick } with `label` already translated
  groups: { type: Array, required: true },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <n-button-group
      v-for="(group, index) in groups"
      :key="index"
      class="flex! w-full flex-col"
      vertical
    >
      <my-button
        v-for="button in group"
        :key="button.id"
        class="w-full justify-start! px-6!"
        size="large"
        :disabled="disabled"
        :icon="button.icon"
        :label="button.label"
        @click="button.onClick()"
      />
    </n-button-group>
  </div>
</template>

<style scoped>
/* Group corners match a standalone button's visible radius (half of the 2.5rem button height) */
.n-button-group :deep(.n-button) {
  border-radius: 0;
}

.n-button-group :deep(.n-button:first-child) {
  border-top-left-radius: 1.25rem;
  border-top-right-radius: 1.25rem;
}

.n-button-group :deep(.n-button:last-child) {
  border-bottom-left-radius: 1.25rem;
  border-bottom-right-radius: 1.25rem;
}
</style>
