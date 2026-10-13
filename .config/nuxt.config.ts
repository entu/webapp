import tailwindcss from '@tailwindcss/vite'

// Sentry release creation, sourcemap upload and build telemetry run on every build unless SENTRY_UPLOAD=false — set that in the local .env.
const sentryUpload = process.env.SENTRY_UPLOAD !== 'false'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@sentry/nuxt/module',
    '@vueuse/nuxt',
    'nuxtjs-naive-ui'
  ],
  ssr: false,
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_PUBLIC_TITLE || 'Entu',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#F1F5F9', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#1D293D', media: '(prefers-color-scheme: dark)' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ],
      script: [
        { src: 'https://analytics.entu.dev/ea.min.js', 'data-site': 'entu.app', crossorigin: 'anonymous', defer: true }
      ]
    }
  },
  css: ['~/assets/tailwind.css'],
  spaLoadingTemplate: false,
  runtimeConfig: {
    public: {
      apiUrl: '',
      commitHash: '',
      title: 'Entu',
      sentry: {
        dsn: ''
      }
    }
  },
  sourcemap: {
    client: 'hidden'
  },
  future: {
    compatibilityVersion: 4
  },
  experimental: {
    checkOutdatedBuildInterval: 10 * 1000,
    viewTransition: true,
    typedPages: true
  },
  compatibilityDate: '2025-04-01',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'dompurify',
        'highlight.js/lib/core',
        'highlight.js/lib/languages/yaml',
        'marked',
        'naive-ui',
        'yaml'
      ]
    }
  },
  eslint: {
    config: {
      autoInit: false,
      stylistic: true
    }
  },
  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'et', name: 'Eesti keel' }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: false
    },
    vueI18n: '~~/.config/i18n.config.ts'
  },
  icon: {
    customCollections: [{
      prefix: 'local',
      dir: './app/assets/icons'
    }]
  },
  sentry: {
    configDir: '.config',
    org: 'entu',
    project: 'webapp',
    telemetry: sentryUpload,
    sourcemaps: { disable: !sentryUpload },
    release: { create: sentryUpload, finalize: sentryUpload }
  }
})
