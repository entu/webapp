// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Entu',
      link: [
        { rel: 'icon', type: 'image/png', href: '/entu-logo.png' }
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
  css: ['~/assets/css/main.css'],
  modules: [
    ['@pinia/nuxt', { autoImports: ['defineStore', 'storeToRefs'] }],
    ['@pinia-plugin-persistedstate/nuxt']
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
      gitSha: 'local'
    }
  }
})
