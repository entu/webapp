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
      class="max-w-full [&_.n-tag\_\_content]:min-w-0 [&_.n-tag\_\_content]:truncate"
      round
      :class="[tagClass, { 'cursor-pointer! **:cursor-pointer!': to }]"
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
