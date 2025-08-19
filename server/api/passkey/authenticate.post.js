import jwt from 'jsonwebtoken'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'

defineRouteMeta({
  openAPI: {
    tags: ['Authentication'],
    description: 'Authenticate using WebAuthn passkey',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              credential: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Credential ID' },
                  rawId: { type: 'string', description: 'Raw credential ID' },
                  response: {
                    type: 'object',
                    properties: {
                      clientDataJSON: { type: 'string', description: 'Client data JSON' },
                      authenticatorData: { type: 'string', description: 'Authenticator data' },
                      signature: { type: 'string', description: 'Authentication signature' },
                      userHandle: { type: 'string', description: 'User handle' }
                    }
                  },
                  type: { type: 'string', example: 'public-key' }
                }
              },
              challenge: { type: 'string', description: 'Challenge from authentication options' }
            },
            required: ['credential', 'challenge']
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Passkey authentication successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                key: { type: 'string', description: 'Temporary JWT token for callback authentication' }
              }
            }
          }
        }
      },
      400: {
        description: 'Bad request - Missing credential or challenge'
      },
      401: {
        description: 'Unauthorized - Passkey not found or verification failed'
      },
      500: {
        description: 'Internal server error - Authentication failed'
      }
    }
  }
})

const { runtimeConfig } = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { credential, challenge } = body

    if (!credential || !challenge) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing credential or challenge'
      })
    }

    // Get all MongoDB connections to search across accounts
    const { getDb } = await import('~/server/utils/mongodb.js')
    const connections = global.MONGODB_CONNECTIONS || {}

    let authenticator = null
    let userEmail = null
    let accountId = null

    // Search for the credential across all account databases
    for (const [dbName, connection] of Object.entries(connections)) {
      if (!dbName.startsWith('entu-')) continue

      try {
        const db = await getDb(dbName)
        const entities = db.collection('entity')

        // Find user with matching credential ID
        const user = await entities.findOne({
          'properties.entu_passkey.credentialId': credential.id
        })

        if (user) {
          // Find the specific passkey
          const passkeyProperty = user.properties.entu_passkey?.find(
            (p) => p.credentialId === credential.id
          )

          if (passkeyProperty) {
            authenticator = {
              credentialID: Buffer.from(passkeyProperty.credentialId, 'base64url'),
              credentialPublicKey: Buffer.from(passkeyProperty.publicKey, 'base64url'),
              counter: passkeyProperty.counter || 0,
              credentialDeviceType: passkeyProperty.deviceType || 'singleDevice',
              credentialBackedUp: passkeyProperty.backedUp || false,
              transports: passkeyProperty.transports || []
            }

            // Get user email from entu_user property
            userEmail = user.properties.entu_user?.[0]?.string
            accountId = dbName.replace('entu-', '')
            break
          }
        }
      }
      catch (error) {
        console.error(`Error searching in database ${dbName}:`, error)
        continue
      }
    }

    if (!authenticator || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Passkey not found'
      })
    }

    // Verify the WebAuthn response
    const { origin, hostname } = getRequestURL(event)

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: hostname,
      authenticator,
      requireUserVerification: true
    })

    if (!verification.verified) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Passkey verification failed'
      })
    }

    // Update counter if verification succeeded and counter increased
    if (verification.authenticationInfo.newCounter > authenticator.counter) {
      try {
        const db = await getDb(`entu-${accountId}`)
        const entities = db.collection('entity')

        await entities.updateOne(
          {
            'properties.entu_passkey.credentialId': credential.id
          },
          {
            $set: {
              'properties.entu_passkey.$.counter': verification.authenticationInfo.newCounter
            }
          }
        )
      }
      catch (error) {
        console.error('Failed to update passkey counter:', error)
        // Don't fail the authentication for counter update issues
      }
    }

    // Create temporary JWT with user email (5 minutes)
    const tempToken = jwt.sign(
      {
        sub: userEmail,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (5 * 60) // 5 minutes
      },
      runtimeConfig.jwtSecret
    )

    return { key: tempToken }
  }
  catch (error) {
    console.error('Passkey authentication error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication failed'
    })
  }
})
