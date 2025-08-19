import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { setEntity } from '~~/server/utils/entity'

defineRouteMeta({
  openAPI: {
    tags: ['Authentication'],
    description: 'Complete WebAuthn passkey registration',
    security: [{ bearerAuth: [] }],
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
                _id: { type: 'string', description: 'Entity ID' },
                properties: { type: 'object', description: 'Updated entity properties' }
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

    // Add passkey property to user entity
    const properties = [{
      type: 'entu_passkey',
      credential: verification.registrationInfo.credentialID,
      public: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.counter || 0,
      device: body.deviceName || 'Unknown Device'
    }]

    const { _id, properties: updatedProperties } = await setEntity(entu, entu.user, properties)

    return {
      success: true,
      _id,
      properties: updatedProperties
    }
  }
  catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Registration failed'
    })
  }
})
