<script setup>
import { NButton } from 'naive-ui'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  bg: { type: Boolean, default: true },
  circle: { type: Boolean, default: false },
  ghost: { type: Boolean, default: false },
  hideLabel: { type: Boolean, default: false },
  icon: { type: String, default: undefined },
  label: { type: String, default: undefined }
})

// A circle has room for the icon only, so its label, like a collapsed one, moves to the tooltip and the accessible name.
const isIconOnly = computed(() => props.circle || props.hideLabel)
</script>

<template>
  <my-tooltip :text="isIconOnly ? label : undefined">
    <n-button
      :aria-label="isIconOnly ? label : undefined"
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
        v-if="label && !isIconOnly"
        #default
      >
        {{ label }}
      </template>
    </n-button>
  </my-tooltip>
</template>
