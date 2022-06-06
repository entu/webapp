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

<style>
.n-menu.n-menu--collapsed .n-menu-item-content {
  padding: 0 !important;
}

.n-menu.n-menu--collapsed .n-menu-item-content .n-menu-item-content-header {
  opacity: 1;
  text-align: center;
}

.n-menu.n-menu--collapsed .n-menu-item-content.n-menu-item-content--collapsed .n-menu-item-content__arrow {
  display: none;
}
</style>
