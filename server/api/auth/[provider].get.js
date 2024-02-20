import jwt from 'jsonwebtoken'

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
    } else {
      return { key: sessionId }
    }
  } else {
    const state = jwt.sign({ next: getQuery(event)?.next }, jwtSecret, {
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
