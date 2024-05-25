<script setup>
import { NConfigProvider, NGlobalStyle, enUS, etEE, dateEnUS, dateEtEE } from 'naive-ui'
import Intercom from '@intercom/messenger-js-sdk'

const runtimeConfig = useRuntimeConfig()
const { locale, setLocale } = useI18n({ useScope: 'global' })

if (!localStorage.getItem('locale')) {
  localStorage.setItem('locale', 'en')
}

setLocale(localStorage.getItem('locale'))

watch(locale, (value) => {
  Intercom({
    app_id: runtimeConfig.public.intercomAppId,
    language_override: value
  })
}, { immediate: true })

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

// eslint-disable-next-line no-console
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
