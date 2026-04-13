<script setup>
import { NConfigProvider, NNotificationProvider } from 'naive-ui'

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
    <n-notification-provider :max="5">
      <nuxt-layout>
        <div class="flex size-full items-center justify-center text-xl">
          {{ error.message }}
        </div>
      </nuxt-layout>
    </n-notification-provider>
  </n-config-provider>
</template>
