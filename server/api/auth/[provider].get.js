import jwt from 'jsonwebtoken'

defineRouteMeta({
  openAPI: {
    tags: ['Authentication'],
    description: 'OAuth callback for authentication providers - redirects to OAuth.ee for authentication',
    security: [], // No authentication required for OAuth callback
    parameters: [
      {
        name: 'provider',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          enum: ['google', 'apple', 'smart-id', 'mobile-id', 'id-card'],
          description: 'OAuth provider'
        }
      },
      {
        name: 'next',
        in: 'query',
        schema: {
          type: 'string',
          description: 'URL to redirect to after successful authentication'
        }
      },
      {
        name: 'code',
        in: 'query',
        schema: {
          type: 'string',
          description: 'OAuth authorization code from provider'
        }
      },
      {
        name: 'error',
        in: 'query',
        schema: {
          type: 'string',
          description: 'OAuth error message if authentication failed'
        }
      },
      {
        name: 'state',
        in: 'query',
        schema: {
          type: 'string',
          description: 'OAuth state parameter for CSRF protection'
        }
      }
    ],
    responses: {
      200: {
        description: 'Authentication successful - returns temporary API key',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                key: {
                  type: 'string',
                  description: 'Temporary API key (single use)',
                  example: 'M2s8xKpwxG77JYxbx7xw4cS9'
                }
              }
            }
          }
        }
      },
      302: {
        description: 'Redirect to next URL with temporary API key appended'
      },
      400: {
        description: 'Authentication error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 400 },
                statusMessage: { type: 'string', example: 'Bad Request' }
              }
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider')
  const { jwtSecret, oauthId, oauthSecret } = useRuntimeConfig(event)
  const { code, error, state } = getQuery(event)
  const audience = getRequestIP(event, { xForwardedFor: true })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error
    })
  }

  if (code && state) {
    const decodedState = jwt.verify(state, jwtSecret, { audience })

    const accessToken = await getToken(code, oauthId, oauthSecret)
    const profile = await $fetch(`https://oauth.ee/api/user?access_token=${accessToken}`)

    const user = {
      ip: audience,
      provider: profile.provider,
      id: profile.id,
      name: profile.name,
      email: profile.email
    }

    const sessionId = await addUserSession(user, jwtSecret)

    if (decodedState.next) {
      await sendRedirect(event, `${decodedState.next}${sessionId}`, 302)
    }
    else {
      return { key: sessionId }
    }
  }
  else {
    const state = jwt.sign({ next: getQuery(event).next }, jwtSecret, {
      audience,
      expiresIn: '5m'
    })

    const { origin, pathname } = getRequestURL(event)

    const url = new URL('https://oauth.ee')
    url.pathname = `/auth/${provider}`
    url.search = new URLSearchParams({
      client_id: oauthId,
      redirect_uri: `${origin}${pathname}`,
      response_type: 'code',
      scope: 'openid',
      state
    }).toString()

    await sendRedirect(event, url.toString(), 302)
  }
})

async function getToken (code, oauthId, oauthSecret) {
  const tokenResponse = await $fetch('https://oauth.ee/api/token', {
    method: 'POST',
    body: {
      client_id: oauthId,
      client_secret: oauthSecret,
      code,
      grant_type: 'authorization_code'
    }
  })

  return tokenResponse.access_token
}

async function addUserSession (user, jwtSecret) {
  const connection = await connectDb('entu')

  const session = await connection.collection('session').insertOne({
    created: new Date(),
    user
  })

  return jwt.sign({}, jwtSecret, {
    audience: user.ip,
    subject: session.insertedId.toString(),
    expiresIn: '5m'
  })
}
