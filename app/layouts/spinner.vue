<script setup>
import { NSpin } from 'naive-ui'
</script>

<template>
  <div class="size-full overflow-auto bg-[color-mix(in_oklab,var(--color-slate-50),white)] dark:bg-surface">
    <n-spin
      class="size-full"
      show
      :delay="200"
    />

    <slot />
  </div>
</template>
