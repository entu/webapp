import { generateRegistrationOptions } from '@simplewebauthn/server'

defineRouteMeta({
  openAPI: {
    tags: ['Passkey'],
    description: 'Generate WebAuthn registration challenge (step 1 of 2 for adding passkey). Returns challenge, RP ID, user info, and registration options for client-side WebAuthn API. User must be authenticated (JWT). Client calls navigator.credentials.create() with these options to generate new credential',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'db',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Database name'
      }
    ],
    responses: {
      200: {
        description: 'WebAuthn registration options',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                challenge: { type: 'string', description: 'Base64URL encoded challenge' },
                rp: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Entu' },
                    id: { type: 'string', example: 'entu.app' }
                  }
                },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', description: 'Base64URL encoded user ID' },
                    name: { type: 'string', description: 'User email' },
                    displayName: { type: 'string', description: 'User display name' }
                  }
                },
                pubKeyCredParams: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      alg: { type: 'number', example: -7 },
                      type: { type: 'string', example: 'public-key' }
                    }
                  }
                },
                authenticatorSelection: {
                  type: 'object',
                  properties: {
                    userVerification: { type: 'string', example: 'preferred' },
                    residentKey: { type: 'string', example: 'preferred' }
                  }
                }
              }
            }
          }
        }
      },
      401: {
        description: 'Unauthorized - Invalid or missing JWT token'
      },
      403: {
        description: 'Forbidden - No authenticated user'
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  if (!entu.userStr) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user ID'
    })
  }

  if (!entu.token?.accounts) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No accounts in token'
    })
  }

  try {
    // Fetch user entity to get email/name
    const db = await connectDb(entu.account)
    const user = await db.collection('entity').findOne(
      { _id: entu.user },
      { projection: { 'private.email.string': 1, 'private.name.string': 1 } }
    )

    // Use email if available, otherwise fall back to user ID
    const userName = user?.private?.name?.at(0)?.string || user?.private?.email?.at(0)?.string || entu.userStr

    const { hostname } = getRequestURL(event)

    const options = await generateRegistrationOptions({
      rpName: 'Entu',
      rpID: hostname,
      userID: Buffer.from(entu.userStr, 'utf8'),
      userName: `${userName} - ${entu.userStr}@${entu.account}`,
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred'
      },
      supportedAlgorithmIDs: [-7, -257] // ES256, RS256
    })

    return options
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to generate registration options'
    })
  }
})
