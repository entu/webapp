import { generateRegistrationOptions } from '@simplewebauthn/server'

defineRouteMeta({
  openAPI: {
    tags: ['Authentication'],
    description: 'Generate WebAuthn registration options for passkey registration',
    security: [{ bearerAuth: [] }],
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

  if (!entu.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No user email'
    })
  }

  const { hostname } = getRequestURL(event)

  const options = await generateRegistrationOptions({
    rpName: 'Entu',
    rpID: hostname,
    userID: entu.userStr,
    userName: entu.email,
    userDisplayName: entu.email,
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred'
    },
    supportedAlgorithmIDs: [-7, -257] // ES256, RS256
  })

  return options
})
