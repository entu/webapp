<script setup>
import { NConfigProvider, NNotificationProvider, NGlobalStyle, enUS, etEE, dateEnUS, dateEtEE } from 'naive-ui'

const runtimeConfig = useRuntimeConfig()
const { locale, setLocale } = useI18n({ useScope: 'global' })

const currentLocale = ref(enUS)
const currentDateLocale = ref(dateEnUS)

function updateNaiveUILocale (localeValue) {
  if (localeValue === 'et') {
    currentLocale.value = etEE
    currentDateLocale.value = dateEtEE
  }
  else {
    currentLocale.value = enUS
    currentDateLocale.value = dateEnUS
  }
}

// Set initial locale from localStorage or browser language
onMounted(() => {
  let targetLocale = localStorage.getItem('locale')

  if (!targetLocale) {
    const defaultLocale = navigator?.language?.split('-')?.at(0) || 'en'
    targetLocale = ['en', 'et'].includes(defaultLocale) ? defaultLocale : 'en'
    localStorage.setItem('locale', targetLocale)
  }

  // Only set locale if it's different from current
  if (locale.value !== targetLocale) {
    setLocale(targetLocale)
  }

  // Update Naive UI locale
  updateNaiveUILocale(targetLocale)
})

// Watch for locale changes and update Naive UI accordingly
watch(locale, (newLocale) => {
  updateNaiveUILocale(newLocale)
}, { immediate: true })

useHead({
  titleTemplate: (title) => {
    return (!title || title === runtimeConfig.public.title) ? runtimeConfig.public.title : `${title} · ${runtimeConfig.public.title}`
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
    <n-notification-provider :max="5">
      <nuxt-layout>
        <nuxt-page />
      </nuxt-layout>
    </n-notification-provider>

    <n-global-style />
  </n-config-provider>
</template>
