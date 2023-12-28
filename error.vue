<script setup>
import { NConfigProvider, NLoadingBarProvider } from 'naive-ui'

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
    <n-loading-bar-provider>
      <nuxt-layout>
        <div class="size-full flex items-center justify-center text-xl">
          {{ error.message }}
        </div>
      </nuxt-layout>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
