import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxtjs-naive-ui'
  ],
  ssr: false,
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_PUBLIC_TITLE || 'Entu',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#1E434C' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
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
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'stripe-pricing-table'
    }
  },
  spaLoadingTemplate: false,
  runtimeConfig: {
    public: {
      apiUrl: '',
      commitHash: '',
      title: 'Entu',
      stripePricingTableIds: '',
      stripePublishableKey: ''
    }
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
        'yaml',
        'highlight.js/lib/core',
        'highlight.js/lib/languages/yaml',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'naive-ui',
        'marked'
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
    vueI18n: '~~/.config/i18n.config.ts'
  },
  icon: {
    customCollections: [{
      prefix: 'local',
      dir: './app/assets/icons'
    }]
  }
})
