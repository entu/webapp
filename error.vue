<script setup>
import { NConfigProvider } from 'naive-ui'

defineProps({
  error: { type: Object, required: true }
})
</script>

<template>
  <n-config-provider
    class="h-full"
    inline-theme-disabled
    :theme-overrides="themeOverrides"
  >
    <nuxt-layout>
      <div class="size-full flex items-center justify-center text-xl">
        {{ error.message }}
      </div>
    </nuxt-layout>
  </n-config-provider>
</template>
