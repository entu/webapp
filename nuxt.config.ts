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
        { children: 'window.__lc=window.__lc||{},window.__lc.license=17768025,function(n,t,c){function e(n){return l._h?l._h.apply(null,n):l._q.push(n)}var l={_q:[],_h:null,_v:"2.0",on:function(){e(["on",c.call(arguments)])},once:function(){e(["once",c.call(arguments)])},off:function(){e(["off",c.call(arguments)])},get:function(){if(!l._h)throw Error("[LiveChatWidget] You can\'t use getters before load.");return e(["get",c.call(arguments)])},call:function(){e(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};n.__lc.asyncInit||l.init(),n.LiveChatWidget=n.LiveChatWidget||l}(window,document,[].slice);' }
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
  runtimeConfig: {
    public: {
      apiUrl: '',
      commitHash: '',
      title: 'Entu'
    },
    jwtSecret: '',
    mongodbUrl: '',
    oauthId: '',
    oauthSecret: '',
    s3Region: '',
    s3Endpoint: '',
    s3Bucket: '',
    s3Key: '',
    s3Secret: ''
  },
  spaLoadingTemplate: false,
  ssr: false
})
