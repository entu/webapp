<script setup>
import { NButton, NPopover } from 'naive-ui'

const { isMobile } = useIsMobile()

defineProps({
  bg: { type: Boolean, default: true },
  circle: { type: Boolean, default: false },
  ghost: { type: Boolean, default: false },
  icon: { type: String, default: undefined },
  label: { type: String, default: undefined },
  tooltip: { type: String, default: undefined }
})
</script>

<template>
  <n-popover
    v-if="!!tooltip"
    class="max-w-sm bg-white! text-sm"
    :disabled="isMobile"
  >
    <template #trigger>
      <n-button
        :circle="circle"
        :ghost="ghost"
        :quaternary="!ghost && !bg"
        :round="!circle"
        :secondary="!ghost && bg"
        v-bind="$attrs"
      >
        <template
          v-if="icon"
          #icon
        >
          <my-icon :icon="icon" />
        </template>

        <template
          v-if="label"
          #default
        >
          {{ label }}
        </template>
      </n-button>
    </template>

    <div class="text-sm text-slate-900!">
      {{ tooltip }}
    </div>
  </n-popover>

  <n-button
    v-else
    :circle="circle"
    :ghost="ghost"
    :quaternary="!ghost && !bg"
    :round="!circle"
    :secondary="!ghost && bg"
    v-bind="$attrs"
  >
    <template
      v-if="icon"
      #icon
    >
      <my-icon :icon="icon" />
    </template>

    <template
      v-if="label"
      #default
    >
      {{ label }}
    </template>
  </n-button>
</template>
