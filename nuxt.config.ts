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
  css: ['~/assets/tailwind.css'],
  i18n: {
    vueI18n: './i18n.config.ts'
  },
  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-icons'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  routeRules: {
    '/api/**': { cors: true }
  },
  runtimeConfig: {
    public: {
      apiUrl: '',
      commitHash: '',
      title: 'Entu',
      stripePaths: ''
    },
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
  spaLoadingTemplate: false,
  ssr: false
})
