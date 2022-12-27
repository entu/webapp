<script setup>
import { NConfigProvider, NLoadingBarProvider } from 'naive-ui'

const runtimeConfig = useRuntimeConfig()
const themeOverrides = {
  Dropdown: {
    optionColorActive: 'rgba(0, 0, 0, .05)',
    optionTextColorActive: 'rgba(0, 0, 0, .8)'
  },
  Menu: {
    arrowColor: 'rgba(255, 255, 255, .7)',
    arrowColorActive: 'rgba(255, 255, 255, 1)',
    arrowColorActiveHover: 'rgba(255, 255, 255, 1)',
    arrowColorChildActive: 'rgba(255, 255, 255, 1)',
    arrowColorChildActiveHover: 'rgba(255, 255, 255, 1)',
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
    itemTextColorChildActiveHover: 'rgba(255, 255, 255, 1)',
    itemTextColorHover: 'rgba(254, 255, 255, 1)',

    itemIconColor: 'rgba(255, 255, 255, .7)',
    itemIconColorActive: 'rgba(255, 255, 255, 1)',
    itemIconColorActiveHover: 'rgba(255, 255, 255, 1)',
    itemIconColorChildActive: 'rgba(255, 255, 255, 1)',
    itemIconColorChildActiveHover: 'rgba(255, 255, 255, 1)',
    itemIconColorCollapsed: 'rgba(255, 255, 255, .7)',
    itemIconColorCollapsedChildActive: 'rgba(255, 255, 255, 1)',
    itemIconColorHover: 'rgba(254, 255, 255, 1)'
  },
  LoadingBar: {
    colorLoading: 'rgb(14 165 233)',
    height: '2px'
  },
  Collapse: {
    arrowColor: '#1E434C',
    dividerColor: 'transparent',
    fontSize: '1rem',
    titleFontSize: '1rem',
    titleFontWeight: '500',
    titleTextColor: '#1E434C'
  }
}

// eslint-disable-next-line no-console
console.log(
  `%cX-Entu-Version:%c ${runtimeConfig.public.gitSha}`,
  'font-weight:bold;color:green;font-family:monospace',
  'color:green;font-family:monospace'
)
</script>

<template>
  <n-config-provider
    class="h-full"
    :theme-overrides="themeOverrides"
  >
    <n-loading-bar-provider>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
