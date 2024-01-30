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
    vueI18n: './i18n.config.ts'
  },
  modules: [
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'nuxt-icons'
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
  spaLoadingTemplate: false,
  ssr: false
})
