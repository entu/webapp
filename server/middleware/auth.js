import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return

  const jwtToken = (getHeader(event, 'authorization') || '').replace('Bearer ', '').trim()
  const account = formatAccount(getQuery(event)?.account)

  const auth = {
    ip: getRequestIP(event, { xForwardedFor: true })
  }

  if (account) {
    auth.account = account
  }

  if (jwtToken) {
    try {
      const { jwtSecret } = useRuntimeConfig(event)
      const decoded = jwt.verify(jwtToken, jwtSecret, { issuer: auth.account, audience: auth.ip })

      if (decoded.aud !== auth.ip) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid JWT audience'
        })
      }

      auth.account = formatAccount(decoded.iss)
      auth.user = getObjectId(decoded.sub)
      auth.userStr = decoded.sub
    } catch (e) {
      throw createError({
        statusCode: 401,
        statusMessage: e.message || e
      })
    }
  }

  if (!event.path.startsWith('/api/auth') && !auth.account) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No account parameter'
    })
  }

  event.context.entu = auth
})

function formatAccount (account) {
  if (mongoDbSystemDbs.includes(account)) return undefined

  return account ? account.replace(/[^a-z0-9]/gi, '').toLowerCase() : undefined
}
