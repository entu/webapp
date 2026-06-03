import * as Sentry from '@sentry/nuxt'

const { sentry, commitHash } = useRuntimeConfig().public

Sentry.init({
  dsn: sentry.dsn,
  release: commitHash || undefined,
  tracesSampleRate: 0.1,
  tracePropagationTargets: ['api.entu.app']
})

