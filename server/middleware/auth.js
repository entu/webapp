import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  const auth = {
    account: getQuery(event)?.account,
    ip: getRequestIP(event, { xForwardedFor: true }),
    token: (getHeader(event, 'authorization') || '').replace('Bearer ', '')
  }

  if (auth.token) {
    try {
      const { jwtSecret } = useRuntimeConfig(event)
      const decoded = jwt.verify(auth.token, jwtSecret, { issuer: auth.account, audience: auth.ip })

      if (decoded.aud !== auth.ip) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid JWT audience'
        })
      }

      auth.account = decoded.iss
      auth.user = decoded.sub
    } catch (e) {
      throw createError({
        statusCode: 401,
        statusMessage: e.message || e
      })
    }
  }

  if (!auth.account) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No account parameter'
    })
  }

  event.context.auth = auth
})
