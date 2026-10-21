<script setup>
import { NTag } from 'naive-ui'

defineProps({
  to: { type: Object, default: undefined },
  target: { type: String, default: undefined },
  icon: { type: String, default: undefined },
  small: { type: Boolean, default: false },
  tagClass: { type: String, default: undefined }
})

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <component
    :is="to ? NuxtLink : 'span'"
    class="inline-flex max-w-full align-top"
    :target="target"
    :to="to"
  >
    <n-tag
      class="max-w-full"
      round
      :class="tagClass"
      :size="small ? 'small' : 'medium'"
    >
      <template
        v-if="$slots.avatar || icon"
        #avatar
      >
        <slot name="avatar">
          <span
            class="flex items-center justify-center"
            :class="{
              'size-4': small,
              'size-5': !small,
            }"
          >
            <my-icon
              :class="{ 'text-xs': small }"
              :icon="icon"
            />
          </span>
        </slot>
      </template>

      <slot />
    </n-tag>
  </component>
</template>

<style scoped>
@reference "tailwindcss";

/* Long tag text ends in an ellipsis instead of overflowing the tag. */
.n-tag :deep(.n-tag__content) {
  @apply min-w-0 truncate;
}

/* Linked tags show a pointer over every part, as naive-ui gives the tag a default cursor. */
a > .n-tag,
a > .n-tag :deep(*) {
  @apply cursor-pointer!;
}
</style>
