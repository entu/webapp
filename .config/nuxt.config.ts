export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/scripts',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxtjs-naive-ui'
  ],
  ssr: false,
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_PUBLIC_TITLE || 'Entu',
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ]
    }
  },
  spaLoadingTemplate: false,
  runtimeConfig: {
    public: {
      apiUrl: '',
      commitHash: '',
      stripePaths: '',
      title: 'Entu'
    },
    jwtSecret: '',
    mongodbUrl: '',
    oauthId: '',
    oauthSecret: '',
    opensearchHostname: '',
    opensearchPort: '',
    opensearchUsername: '',
    opensearchPassword: '',
    runAggregation: false,
    s3Region: '',
    s3Endpoint: '',
    s3Bucket: '',
    s3Key: '',
    s3Secret: '',
    stripeKey: '',
    stripeEndpointSecret: ''
  },
  routeRules: {
    '/api/**': { cors: true }
  },
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2024-08-05',
  nitro: {
    experimental: {
      openAPI: true
    },
    openAPI: {
      meta: {
        title: 'Entu API Documentation',
        description: 'REST API for Entu - a flexible entity-property database system with hierarchical data structures, permission management, and file handling capabilities.',
      },
      production: 'prerender',
      route: '/api/docs/openapi.json',
      ui: {
        scalar: {
          route: '/api/docs',
          spec: {
            url: '/api/openapi'
          },
          theme: 'default',
          hideDownloadButton: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha'
        },
        swagger: false
      }
    }
  },
  eslint: {
    config: {
      autoInit: false,
      stylistic: true
    }
  },
  i18n: {
    vueI18n: './.config/i18n.config.ts'
  },
  icon: {
    customCollections: [{
      prefix: 'local',
      dir: './app/assets/icons'
    }]
  },
  scripts: {
    registry: {
      plausibleAnalytics: { domain: 'entu.app' }
    }
  },
  tailwindcss: {
    cssPath: './app/assets/tailwind.css',
    configPath: './.config/tailwind.config.ts'
  }
})
