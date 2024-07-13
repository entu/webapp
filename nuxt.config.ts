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
      ],
      script: [
        { src: 'https://plausible.io/js/script.js', 'data-domain': 'entu.app', defer: true }
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
    'nuxt-icons',
    'nuxt-security'
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
  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': [
          'https://entu.app',
          'https://entu-files.fra1.digitaloceanspaces.com',
          'https://static.intercomassets.com',
          'https://js.intercomcdn.com'
        ],
        'script-src': [
          'https://entu.app',
          'https://plausible.io',
          'https://js.intercomcdn.com',
          'https://widget.intercom.io'
        ]
      }
    },
    rateLimiter: {
      tokensPerInterval: 600,
      interval: 60000
    },
    ssg: {
      meta: true,
      hashScripts: true,
      hashStyles: false,
      exportToPresets: true
  },
  spaLoadingTemplate: false,
  ssr: false
})
