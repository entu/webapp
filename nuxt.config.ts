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
