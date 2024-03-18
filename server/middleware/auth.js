import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return

  const entu = {
    ip: getRequestIP(event, { xForwardedFor: true }),
    account: formatAccount(getQuery(event)?.account)
  }

  if (!event.path.startsWith('/api/auth') && !entu.account) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No account parameter'
    })
  }

  const jwtToken = (getHeader(event, 'authorization') || '').replace('Bearer ', '').trim()

  if (jwtToken) {
    try {
      const { jwtSecret } = useRuntimeConfig(event)
      const decoded = jwt.verify(jwtToken, jwtSecret, { audience: entu.ip })

      if (decoded.aud !== entu.ip) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid JWT audience'
        })
      }

      if (entu.account && decoded.accounts) {
        entu.user = getObjectId(decoded.accounts[entu.account])
        entu.userStr = decoded.accounts[entu.account]
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
