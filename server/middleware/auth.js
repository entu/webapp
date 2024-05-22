import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return
  if (event.path.startsWith('/api/stripe')) return

  const entu = {
    ip: getRequestIP(event, { xForwardedFor: true }),
    account: event.path.startsWith('/api/auth') ? undefined : formatDatabaseName(event.path.split('/').at(2))
  }

  if (!event.path.startsWith('/api/auth') && !entu.account) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No account parameter'
    })
  }

  entu.tokenStr = (getHeader(event, 'authorization') || '').replace('Bearer ', '').trim()

  if (!event.path.startsWith('/api/auth') && entu.tokenStr) {
    try {
      const { jwtSecret } = useRuntimeConfig(event)
      entu.token = jwt.verify(entu.tokenStr, jwtSecret, { audience: entu.ip })

      if (entu.token.aud !== entu.ip) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid JWT audience'
        })
      }

      if (entu.token.accounts?.[entu.account]) {
        entu.user = getObjectId(entu.token.accounts[entu.account])
        entu.userStr = entu.token.accounts[entu.account]
      }
    } catch (e) {
      throw createError({
        statusCode: 401,
        statusMessage: e.message || e
      })
    }
  }

  event.context.entu = entu
})
