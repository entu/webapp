import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: { server: { port: 3003 } },
  sitemap: { hostname: 'https://entu.ee' },
  cleanUrls: true,
  title: 'Entu',
  titleTemplate: ':title · Entu',
  description: 'Build your data model without code — configure entities, properties, and access rights entirely through the UI',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['script', { src: 'https://analytics.entu.dev/ea.min.js', 'data-site': 'entu.ee', crossorigin: 'anonymous', defer: '' }]
  ],
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Overview', link: '/overview/' },
      { text: 'Configuration', link: '/configuration/entity-types' },
      { text: 'API', link: '/api/quickstart' },
      { text: 'Pricing', link: '/#pricing' }
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'What is Entu', link: '/overview/' },
          { text: 'Entities', link: '/overview/entities' },
          { text: 'Properties', link: '/overview/properties' },
          { text: 'Authentication', link: '/overview/authentication' }
        ]
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Entity Types', link: '/configuration/entity-types' },
          { text: 'Users', link: '/configuration/users' },
          { text: 'Menus', link: '/configuration/menus' },
          { text: 'Plugins', link: '/configuration/plugins' },
          { text: 'Best Practices', link: '/configuration/best-practices' },
          { text: 'Examples', link: '/examples' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'Quick Start', link: '/api/quickstart' },
          { text: 'Authentication', link: '/api/authentication' },
          { text: 'Best Practices', link: '/api/best-practices' },
          { text: 'Query Reference', link: '/api/query-reference' },
          { text: 'Properties', link: '/api/properties' },
          { text: 'Formulas', link: '/api/formulas' },
          { text: 'Files', link: '/api/files' },
          { text: 'API Reference', link: 'https://entu.dev' }
        ]
      },
      {
        text: 'Changelog',
        items: [
          { text: 'Changelog', link: '/changelog' }
        ]
      }
    ],
    search: { provider: 'local' },
    footer: {
      message: '<a href="/terms">Terms of Service</a> &nbsp;·&nbsp; <a href="https://climate.stripe.com/GdfbXF" target="_blank" rel="noopener">Stripe Climate</a><br><strong>Entusiastid OÜ</strong> &nbsp;·&nbsp; Saturni 3-3, 10142 Tallinn &nbsp;·&nbsp; <a href="mailto:info@entu.ee">info@entu.ee</a>'
    }
  }
})
