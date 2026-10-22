<script setup>
import { NPopover } from 'naive-ui'
import { cloneVNode } from 'vue'

// Disabled keeps the popover mounted without showing it, so toggling it doesn't remount the slotted element.
const props = defineProps({
  disabled: { type: Boolean, default: false },
  text: { type: String, default: undefined }
})

const slots = useSlots()
const { isMobile } = useIsMobile()

const isHovered = ref(false)
const isFocused = ref(false)

const isShown = computed(() => !props.disabled && !isMobile.value && (isHovered.value || isFocused.value))

function onMouseenter () {
  isHovered.value = true
}

function onMouseleave () {
  isHovered.value = false
}

// Only keyboard focus shows it, so a mouse click doesn't leave the tooltip open until blur.
function onFocusin (event) {
  isFocused.value = event.target.matches(':focus-visible')
}

function onFocusout () {
  isFocused.value = false
}

// The slotted element with hover and focus listeners merged in, so it stays the popover's own trigger.
function renderTrigger () {
  return cloneVNode(slots.default().at(0), { onMouseenter, onMouseleave, onFocusin, onFocusout }, true)
}
</script>

<template>
  <n-popover
    v-if="text"
    class="max-w-sm bg-surface! text-sm"
    trigger="manual"
    :show="isShown"
  >
    <template #trigger>
      <component :is="renderTrigger()" />
    </template>

    <div class="text-sm text-slate-900! dark:text-slate-100!">
      {{ text }}
    </div>
  </n-popover>

  <!-- Rendered as the element itself, not a slot fragment, so a parent's ref or popover trigger gets the real element -->
  <component
    :is="slots.default().at(0)"
    v-else
  />
</template>
