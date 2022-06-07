<template>
  <n-theme-editor v-if="location.hostname === 'localhost'" />
  <n-config-provider :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-notification-provider>
        <router-view />
      </n-notification-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NLoadingBarProvider, NNotificationProvider, NThemeEditor } from 'naive-ui'
const themeOverrides = {
  common: {
    fontFamily: "Avenir, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: '1rem',
    fontSizeMini: '.75rem'
  },
  Dropdown: {
    optionColorActive: 'rgba(0, 0, 0, .05)',
    optionTextColorActive: 'rgba(0, 0, 0, .8)'
  },
  Menu: {
    arrowColor: 'rgba(255, 255, 255, .7)',
    arrowColorActive: 'rgba(255, 255, 255, 1)',
    arrowColorActiveHover: 'rgba(255, 255, 255, 1)',
    arrowColorChildActive: 'rgba(255, 255, 255, 1)',
    arrowColorHover: 'rgba(255, 255, 255, 1)',

    borderRadius: '0',
    dividerColor: 'rgba(255, 255, 255, .2)',

    itemColorActive: 'rgba(255, 255, 255, 0.15)',
    itemColorActiveCollapsed: 'rgba(24, 160, 88, 0.1)',
    itemColorActiveHover: 'rgba(255, 255, 255, 0.15)',

    itemColorHover: 'rgba(255, 255, 255, 0.05)',

    itemTextColor: 'rgba(255, 255, 255, .7)',
    itemTextColorActive: 'rgba(255, 255, 255, 1)',
    itemTextColorActiveHover: 'rgba(255, 255, 255, 1)',
    itemTextColorChildActive: 'rgba(255, 255, 255, 1)',
    itemTextColorHover: 'rgba(254, 255, 255, 1)',

    itemIconColor: 'rgba(255, 255, 255, .7)',
    itemIconColorActive: 'rgba(255, 255, 255, 1)',
    itemIconColorActiveHover: 'rgba(255, 255, 255, 1)',
    itemIconColorChildActive: 'rgba(255, 255, 255, 1)',
    itemIconColorCollapsed: 'rgba(255, 255, 255, .7)',
    itemIconColorCollapsedChildActive: 'rgba(255, 255, 255, 1)',
    itemIconColorHover: 'rgba(254, 255, 255, 1)'
  },
  Layout: {
    siderColor: 'rgba(30, 67, 76, 1)',
    siderToggleBarColor: 'rgba(30, 67, 76, 1)',
    siderToggleBarColorHover: 'rgba(30, 67, 76, 1)'
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.n-menu-item-content.n-menu-item-content--child-active .n-menu-item-content-header{
  font-weight: bold;
}
</style>
