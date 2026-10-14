<script setup>
import { NPopover } from 'naive-ui'

defineProps({
  text: { type: String, default: undefined }
})

const { isMobile } = useIsMobile()
</script>

<template>
  <n-popover
    v-if="text"
    class="max-w-sm bg-surface! text-sm"
    :disabled="isMobile"
  >
    <template #trigger>
      <slot />
    </template>

    <div class="text-sm text-slate-900! dark:text-slate-100!">
      {{ text }}
    </div>
  </n-popover>

  <slot v-else />
</template>
