import { verifyRegistrationResponse } from '@simplewebauthn/server'

defineRouteMeta({
  openAPI: {
    tags: ['Authentication'],
    description: 'Complete WebAuthn passkey registration for current database',
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
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Credential ID' },
              rawId: { type: 'string', description: 'Raw credential ID' },
              response: {
                type: 'object',
                properties: {
                  clientDataJSON: { type: 'string', description: 'Client data JSON' },
                  attestationObject: { type: 'string', description: 'Attestation object' }
                }
              },
              type: { type: 'string', example: 'public-key' },
              expectedChallenge: { type: 'string', description: 'Expected challenge from registration options' },
              deviceName: { type: 'string', description: 'User-friendly device name', example: 'iPhone 15 Pro' }
            },
            required: ['id', 'rawId', 'response', 'type', 'expectedChallenge']
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Passkey registration successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                _id: { type: 'string', description: 'User entity ID' },
                properties: {
                  type: 'array',
                  description: 'Updated entity properties',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string', description: 'Property ID' },
                      type: { type: 'string', example: 'entu_passkey' },
                      string: { type: 'string', description: 'Display string', example: 'iPhone 15 Pro A1B2' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      400: {
        description: 'Registration failed - Invalid WebAuthn response'
      },
      403: {
        description: 'Forbidden - No authenticated user'
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const body = await readBody(event)

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  if (!entu.account) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No account in context'
    })
  }

  const { origin, hostname } = getRequestURL(event)

  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: body.expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: hostname
    })

    if (!verification.verified) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Registration verification failed'
      })
    }

    // Extract credential data from verification response
    const credential = verification.registrationInfo?.credential
    const credentialPublicKey = credential?.publicKey
    const counter = credential?.counter || 0

    if (!credentialPublicKey) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing credential public key'
      })
    }

    // Store only essential data: credential ID, public key, counter, device name
    const properties = [{
      type: 'entu_passkey',
      passkey_id: body.id,
      passkey_public: Buffer.from(credentialPublicKey).toString('base64url'),
      passkey_counter: counter,
      passkey_device: body.deviceName || 'Unknown Device'
    }]

    // Store passkey in current database only
    const result = await setEntity(entu, entu.user, properties)

    return {
      success: true,
      _id: result._id.toString(),
      properties: result.properties.map((p) => ({
        _id: p._id.toString(),
        type: p.type,
        string: `${p.passkey_device || ''} ${p._id.toString().slice(-4).toUpperCase()}`.trim()
      }))
    }
  }
  catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Registration failed'
    })
  }
})
