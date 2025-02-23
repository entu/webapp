<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButton, NPopover } from 'naive-ui'

defineProps({
  bg: { type: Boolean, default: true },
  circle: { type: Boolean, default: false },
  icon: { type: String, default: undefined },
  label: { type: String, default: undefined },
  tooltip: { type: String, default: undefined }
})
</script>

<template>
  <n-popover
    v-if="!!tooltip"
    class="max-w-sm !bg-white text-sm"
  >
    <template #trigger>
      <n-button
        :secondary="bg"
        :quaternary="!bg"
        :circle="circle"
        :round="!circle"
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

    <div class="text-sm !text-slate-900">
      {{ tooltip }}
    </div>
  </n-popover>

  <n-button
    v-else
    :secondary="bg"
    :quaternary="!bg"
    :circle="circle"
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
