<script setup>
import { NSpin } from 'naive-ui'
</script>

<template>
  <div class="size-full overflow-auto bg-[color-mix(in_oklab,var(--color-gray-50),white)]">
    <n-spin
      class="size-full"
      show
      :delay="200"
    />

    <slot />
  </div>
</template>
