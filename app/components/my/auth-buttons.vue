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
      class="flex! w-full flex-col gap-0.5"
      vertical
    >
      <my-button
        v-for="button in group"
        :key="button.id"
        class="h-12! w-full justify-start! px-6! sm:h-10!"
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
/* Group corners are half the button height, which is taller on phones for an easier tap target */
.n-button-group {
  --group-radius: 1.5rem;
}

@media (min-width: 40rem) {
  .n-button-group {
    --group-radius: 1.25rem;
  }
}

.n-button-group :deep(.n-button) {
  border-radius: 0;
}

.n-button-group :deep(.n-button:first-child) {
  border-top-left-radius: var(--group-radius);
  border-top-right-radius: var(--group-radius);
}

.n-button-group :deep(.n-button:last-child) {
  border-bottom-left-radius: var(--group-radius);
  border-bottom-right-radius: var(--group-radius);
}
</style>
