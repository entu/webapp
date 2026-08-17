<script setup>
import { NSpin } from 'naive-ui'
</script>

<template>
  <div class="size-full overflow-auto bg-gray-50">
    <n-spin
      class="size-full"
      show
      :delay="200"
    />

    <slot />
  </div>
</template>
