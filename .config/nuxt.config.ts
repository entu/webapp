// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2024-08-05',
  alias: {
    pinia: '/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs' // https://stackoverflow.com/questions/74003458/cannot-find-module-pinia-dist-pinia-mjs-when-using-run-dev
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_PUBLIC_TITLE || 'Entu',
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ],
    }
  },
  eslint: {
    config: {
      autoInit: false,
      stylistic: true
    }
  },
  future: {
    compatibilityVersion: 4
  },
  i18n: {
    vueI18n: '~/.config/i18n.config.ts'
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/scripts',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-icons',
    'nuxtjs-naive-ui'
  ],
  nitro: {
    experimental: {
      openAPI: true
    }
  },
  routeRules: {
    '/api/**': { cors: true }
  },
  runtimeConfig: {
    public: {
      apiUrl: '',
      commitHash: '',
      intercomAppId: '',
      stripePaths: '',
      title: 'Entu'
    },
    intercomSecret: '',
    jwtSecret: '',
    mongodbUrl: '',
    oauthId: '',
    oauthSecret: '',
    s3Region: '',
    s3Endpoint: '',
    s3Bucket: '',
    s3Key: '',
    s3Secret: '',
    stripeKey: '',
    stripeEndpointSecret: ''
  },
  scripts: {
    registry: {
      plausibleAnalytics: { domain: 'entu.app' }
    }
  },
  spaLoadingTemplate: false,
  ssr: false,
  tailwindcss: {
    cssPath: '~/assets/tailwind.css',
    configPath: '~/.config/tailwind.config.ts'
  }
})
