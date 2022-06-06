<template>
  <n-loading-bar-provider>
    <n-notification-provider>
      <router-view />
    </n-notification-provider>
  </n-loading-bar-provider>
</template>

<script setup>
import { NLoadingBarProvider, NNotificationProvider } from 'naive-ui'
</script>
