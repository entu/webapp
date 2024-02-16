import https from 'https'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider')
  const { jwtSecret, oauthId, oauthSecret } = useRuntimeConfig(event)
  const { code, error, state } = getQuery(event)
  const audience = getRequestIP(event, { xForwardedFor: true })

  // console.log(getQuery(event))

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error
    })
  }

  if (code && state) {
    const decodedState = jwt.verify(state, jwtSecret, { audience })

    const accessToken = await getToken(code, oauthId, oauthSecret)
    const profile = await getProfile(accessToken)

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

    const url = new URL('https://oauth.ee')
    url.pathname = `/auth/${provider}`
    url.search = new URLSearchParams({
      client_id: oauthId,
      redirect_uri: `https://${getRequestHost(event)}${event.path.split('?').at(0)}`,
      response_type: 'code',
      scope: 'openid',
      state
    }).toString()

    await sendRedirect(event, url.toString(), 302)
  }
})

const getToken = async (code, oauthId, oauthSecret) => {
  return new Promise((resolve, reject) => {
    const query = JSON.stringify({
      client_id: oauthId,
      client_secret: oauthSecret,
      code,
      grant_type: 'authorization_code'
    })

    const options = {
      host: 'oauth.ee',
      port: 443,
      method: 'POST',
      path: '/api/token',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': query.length
      }
    }

    https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        data = JSON.parse(data)

        if (res.statusCode === 200 && data.access_token) {
          resolve(data.access_token)
        } else {
          reject(data)
        }
      })
    }).on('error', (err) => {
      reject(err)
    }).write(query)
  })
}

const getProfile = (accessToken) => {
  return new Promise((resolve, reject) => {
    const url = new URL('https://oauth.ee')
    url.pathname = '/api/user'
    url.search = new URLSearchParams({
      access_token: accessToken
    }).toString()

    https.get(url, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        data = JSON.parse(data)

        if (res.statusCode === 200) {
          resolve(data)
        } else {
          reject(data)
        }
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
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
