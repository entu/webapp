// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  alias: {
    pinia: '/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs' // https://stackoverflow.com/questions/74003458/cannot-find-module-pinia-dist-pinia-mjs-when-using-run-dev
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_PUBLIC_TITLE || 'Entu',
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ]
    }
  },
  build: {
    transpile: process.env.NODE_ENV === 'production'
      ? [
          'naive-ui',
          'vueuc'
          // '@css-render/vue3-ssr',
          // '@juggle/resize-observer'
        ]
      : [
          // '@juggle/resize-observer'
        ]
  },
  css: ['~/assets/main.css'],
  i18n: {
    vueI18n: {
      legacy: false,
      locale: 'en'
    }
  },
  modules: [
    ['@nuxtjs/i18n'],
    ['@pinia/nuxt', { autoImports: ['defineStore', 'storeToRefs'] }],
    ['@vueuse/nuxt']
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
      title: ''
    }
  },
  ssr: false
})
