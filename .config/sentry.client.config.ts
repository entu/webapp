import * as Sentry from '@sentry/nuxt'

const { sentry, commitHash } = useRuntimeConfig().public

Sentry.init({
  dsn: sentry.dsn,
  // Never report errors from local development
  enabled: !['localhost', '127.0.0.1'].includes(window.location.hostname),
  release: commitHash || undefined,
  tracesSampleRate: 0.1,
  tracePropagationTargets: ['api.entu.app']
})

