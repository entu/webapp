<script setup>
import { NConfigProvider, NGlobalStyle, enUS, etEE, dateEnUS, dateEtEE } from 'naive-ui'

const runtimeConfig = useRuntimeConfig()
const { locale, setLocale } = useI18n({ useScope: 'global' })

if (!localStorage.getItem('locale')) {
  const defaultLocale = navigator?.language?.split('-')?.at(0) || 'en'
  localStorage.setItem('locale', defaultLocale)
}

setLocale(localStorage.getItem('locale'))

const currentLocale = ref(enUS)
const currentDateLocale = ref(dateEnUS)

useHead({
  titleTemplate: (title) => {
    return (!title || title === runtimeConfig.public.title) ? runtimeConfig.public.title : `${title} · ${runtimeConfig.public.title}`
  }
})

onMounted(() => {
  if (locale.value === 'et') {
    currentLocale.value = etEE
    currentDateLocale.value = dateEtEE
  }
})

console.log(
  `%cX-Entu-Version:%c ${runtimeConfig.public.commitHash}`,
  'font-weight:bold;color:green;font-family:monospace',
  'color:green;font-family:monospace'
)
</script>

<template>
  <n-config-provider
    class="h-full"
    inline-theme-disabled
    :locale="currentLocale"
    :date-locale="currentDateLocale"
    :theme-overrides="themeOverrides"
  >
    <nuxt-layout>
      <nuxt-page />
    </nuxt-layout>

    <n-global-style />
  </n-config-provider>
</template>
