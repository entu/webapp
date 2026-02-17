import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

defineRouteMeta({
  openAPI: {
    tags: ['Passkey'],
    description: 'Verify WebAuthn authentication response (step 2 of 2 for passkey login). Searches all databases for matching credential ID, verifies signature with stored public key, updates usage counter, and returns JWT tokens for all databases where user has access. Prevents replay attacks via challenge validation',
    security: [], // No authentication required for login
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
                  authenticatorData: { type: 'string', description: 'Authenticator data' },
                  signature: { type: 'string', description: 'Signature' }
                }
              },
              type: { type: 'string', example: 'public-key' },
              expectedChallenge: { type: 'string', description: 'Expected challenge from authentication options' }
            },
            required: ['id', 'rawId', 'response', 'type', 'expectedChallenge']
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Authentication successful',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accounts: {
                  type: 'array',
                  description: 'Array of databases user has access to',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string', description: 'Database ID' },
                      name: { type: 'string', description: 'Database name' },
                      user: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', description: 'User ID' },
                          name: { type: 'string', description: 'User name' }
                        }
                      }
                    }
                  }
                },
                token: { type: 'string', description: 'JWT token for API access' }
              }
            }
          }
        }
      },
      400: {
        description: 'Authentication failed - Invalid WebAuthn response'
      },
      404: {
        description: 'Credential not found in any database'
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { origin, hostname } = getRequestURL(event)
  const { mongodbUrl, jwtSecret } = useRuntimeConfig()
  const audience = getRequestIP(event, { xForwardedFor: true })

  // Connect to MongoDB to search all databases
  const dbClient = new MongoClient(mongodbUrl)
  await dbClient.connect()

  try {
    // Search all databases for the credential
    const dbs = await dbClient.db().admin().listDatabases()
    let authenticatorData = null
    const accountsFound = []

    // Credential ID from browser is already base64url - search for it directly
    const credentialId = body.id

    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name

      if (mongoDbSystemDbs.includes(dbName)) continue

      const db = dbClient.db(dbName)

      // Find user with this passkey credential (stored as base64url string)
      const user = await db.collection('entity').findOne({
        'private.entu_passkey.passkey_id': credentialId
      }, {
        projection: {
          _id: true,
          'private.name.string': true,
          'private.entu_passkey': true
        }
      })

      if (user?.private?.entu_passkey) {
        // Find the specific passkey by comparing credential strings
        const passkeyProp = user.private.entu_passkey.find((pk) => {
          return pk.passkey_id === credentialId
        })

        if (passkeyProp && !authenticatorData) {
          // Query property collection directly to get the public key
          const propertyDoc = await db.collection('property').findOne({
            _id: passkeyProp._id,
            type: 'entu_passkey',
            deleted: { $exists: false }
          })

          if (!propertyDoc?.passkey_public) {
            throw new Error('Public key not found in property document')
          }

          authenticatorData = {
            credentialID: Buffer.from(propertyDoc.passkey_id, 'base64url'),
            credentialPublicKey: Buffer.from(propertyDoc.passkey_public, 'base64url'),
            counter: propertyDoc.passkey_counter || 0,
            user: user._id,
            userName: user.private?.name?.at(0)?.string || user._id.toString()
          }
        }

        if (passkeyProp) {
          accountsFound.push({
            dbName,
            userId: user._id.toString(),
            userName: user.private?.name?.at(0)?.string || user._id.toString()
          })
        }
      }
    }

    if (!authenticatorData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Credential not found'
      })
    }

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: {
        id: body.id,
        rawId: body.rawId,
        response: body.response,
        type: body.type
      },
      expectedChallenge: body.expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: hostname,
      credential: {
        id: authenticatorData.credentialID,
        publicKey: authenticatorData.credentialPublicKey,
        counter: authenticatorData.counter
      }
    })

    if (!verification.verified) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Authentication verification failed'
      })
    }

    // Update counter in all databases where user has this passkey
    const newCounter = verification.authenticationInfo?.newCounter ?? authenticatorData.counter + 1

    for (const account of accountsFound) {
      const db = dbClient.db(account.dbName)

      await db.collection('property').updateMany({
        entity: getObjectId(account.userId),
        type: 'entu_passkey',
        passkey_id: credentialId,
        deleted: { $exists: false }
      }, {
        $set: { passkey_counter: newCounter }
      })

      await aggregateEntity({
        account: account.dbName,
        user: getObjectId(account.userId),
        userStr: account.userId,
        db
      }, getObjectId(account.userId))
    }

    // Build JWT token and response
    const accountUsersIds = Object.fromEntries(
      accountsFound.map((acc) => [acc.dbName, acc.userId])
    )

    return {
      accounts: accountsFound.map((acc) => ({
        _id: acc.dbName,
        name: acc.dbName,
        user: {
          _id: acc.userId,
          name: acc.userName
        }
      })),
      token: jwt.sign({ accounts: accountUsersIds }, jwtSecret, {
        audience,
        expiresIn: '48h'
      })
    }
  }
  catch (error) {
    throw createError({
      statusCode: error.statusCode || 400,
      statusMessage: error.statusMessage || error.message || 'Authentication failed'
    })
  }
  finally {
    await dbClient.close()
  }
})
