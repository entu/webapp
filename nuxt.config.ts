// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_PUBLIC_TITLE || 'Entu',
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ]
    }
  },
  css: ['~/assets/tailwind.css'],
  i18n: {
    vueI18n: {
      datetimeFormats: {
        en: {
          date: { year: 'numeric', month: '2-digit', day: '2-digit' },
          datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }
        },
        et: {
          date: { year: 'numeric', month: '2-digit', day: '2-digit' },
          datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
        }
      },
      legacy: false,
      locale: 'en',
      fallbackLocale: 'en'
    }
  },
  modules: [
    '@nuxtjs/i18n',
    '@vueuse/nuxt'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    public: {
      apiUrl: '',
      gitSha: '',
      title: 'Entu'
    }
  },
  ssr: false
})
