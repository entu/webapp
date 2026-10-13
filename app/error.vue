<script setup>
import { NConfigProvider, NNotificationProvider, darkTheme } from 'naive-ui'

defineProps({
  error: { type: Object, required: true }
})

const isDark = usePreferredDark()
</script>

<template>
  <n-config-provider
    class="h-full"
    inline-theme-disabled
    :theme="isDark ? darkTheme : null"
    :theme-overrides="isDark ? darkThemeOverrides : themeOverrides"
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
