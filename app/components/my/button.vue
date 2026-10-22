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
  <!-- The tooltip stays mounted while the label collapses, so the button isn't remounted and the collapse animates. -->
  <my-tooltip
    :disabled="!isIconOnly"
    :text="label"
  >
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

      <!-- A collapsed label stays in the DOM at zero width, so collapsing animates and the toolbar can measure it. The icon-to-label gap is the label's padding, so it collapses too and the icon stays centred. -->
      <template
        v-if="label && !circle"
        #default
      >
        <span
          class="grid transition-[grid-template-columns,opacity] duration-200 ease-out motion-reduce:transition-none"
          :aria-hidden="hideLabel || undefined"
          :class="{
            'grid-cols-[1fr]': !hideLabel,
            'grid-cols-[0fr] opacity-0': hideLabel,
          }"
        >
          <span
            class="min-w-0 overflow-hidden whitespace-nowrap"
            data-button-label
          >
            <span :class="{ 'pl-1.5': icon }">{{ label }}</span>
          </span>
        </span>
      </template>
    </n-button>
  </my-tooltip>
</template>

<style scoped>
/* The icon-to-label gap is the label's own padding, so it collapses with the label. */
.n-button :deep(.n-button__icon) {
  margin-right: 0;
}
</style>
