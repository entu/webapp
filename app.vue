<script setup>
import { NConfigProvider, NGlobalStyle, NLoadingBarProvider } from 'naive-ui'

const runtimeConfig = useRuntimeConfig()

useHead({
  titleTemplate: (title) => {
    return (!title || title === runtimeConfig.public.title) ? runtimeConfig.public.title : `${title} · ${runtimeConfig.public.title}`
  }
})

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
    inline-theme-disabled
    :theme-overrides="themeOverrides"
  >
    <n-loading-bar-provider>
      <nuxt-layout>
        <nuxt-page />
      </nuxt-layout>
    </n-loading-bar-provider>

    <n-global-style />
  </n-config-provider>
</template>
