import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Entu Documentation',
  description: 'Documentation for the Entu flexible object database',
  head: [
    ['script', { src: 'https://analytics.entu.dev/ea.min.js', 'data-site': 'entu.dev', crossorigin: 'anonymous', defer: '' }],
  ],
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Overview', link: '/overview/entities' },
      { text: 'Configuration', link: '/configuration/entity-types' },
      { text: 'Hosting', link: 'https://entu.ee/#price' },
      { text: 'API Reference', link: 'https://entu.app/api/docs' },
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Entities', link: '/overview/entities' },
          { text: 'Properties', link: '/overview/properties' },
          { text: 'Authentication', link: '/overview/authentication' },
        ],
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Entity Types', link: '/configuration/entity-types' },
          { text: 'Users', link: '/configuration/users' },
          { text: 'Menus', link: '/configuration/menus' },
          { text: 'Plugins', link: '/configuration/plugins' },
          { text: 'Best Practices', link: '/configuration/best-practices' },
        ],
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
          { text: 'API Reference', link: 'https://entu.app/api/docs' },
        ],
      },
      {
        text: 'Changelog',
        items: [
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],
    search: { provider: 'local' },
  },
})
