<script setup>
import { NConfigProvider, NNotificationProvider, NGlobalStyle, darkTheme, enUS, etEE, dateEnUS, dateEtEE } from 'naive-ui'

const runtimeConfig = useRuntimeConfig()

// Dark mode follows the system, like the Tailwind colors in app/assets/tailwind.css.
const isDark = usePreferredDark()
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

// Set initial locale from query parameter, localStorage or browser language
onMounted(() => {
  const queryLocale = new URLSearchParams(window.location.search).get('locale')
  let targetLocale = ['en', 'et'].includes(queryLocale) ? queryLocale : localStorage.getItem('locale')

  if (!targetLocale) {
    const defaultLocale = navigator?.language?.split('-')?.at(0) || 'en'
    targetLocale = ['en', 'et'].includes(defaultLocale) ? defaultLocale : 'en'
  }

  localStorage.setItem('locale', targetLocale)

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

// Screen readers pick their voice from <html lang>, so it follows the UI language.
useHead({
  htmlAttrs: { lang: locale },
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
    :date-locale="currentDateLocale"
    :locale="currentLocale"
    :theme="isDark ? darkTheme : null"
    :theme-overrides="isDark ? darkThemeOverrides : themeOverrides"
  >
    <n-notification-provider :max="5">
      <nuxt-layout>
        <nuxt-page />
      </nuxt-layout>
    </n-notification-provider>

    <n-global-style />
  </n-config-provider>
</template>
