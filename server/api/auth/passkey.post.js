import { verifyAuthenticationResponse } from '@simplewebauthn/server'
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
  const { jwtSecret } = useRuntimeConfig(event)
  const audience = getRequestIP(event, { xForwardedFor: true })

  const entuDb = await connectDb('entu')
  const dbs = await entuDb.admin().listDatabases()
  const credentialId = body.id

  // Search all tenant databases for the credential in parallel
  const dbMatches = (await Promise.all(
    dbs.databases
      .filter(({ name }) => !mongoDbSystemDbs.includes(name))
      .map(async ({ name: dbName }) => {
        const db = await connectDb(dbName)

        const user = await db.collection('entity').findOne(
          { 'private.entu_passkey.passkey_id': credentialId },
          { projection: { _id: true, 'private.name.string': true, 'private.entu_passkey': true } }
        )

        if (!user?.private?.entu_passkey) return null

        const passkeyProp = user.private.entu_passkey.find((pk) => pk.passkey_id === credentialId)
        if (!passkeyProp) return null

        return { dbName, db, user, passkeyProp }
      })
  )).filter(Boolean)

  if (dbMatches.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Credential not found' })
  }

  // Fetch public key from first matching database
  const { db: firstDb, passkeyProp: firstPasskeyProp } = dbMatches[0]
  const propertyDoc = await firstDb.collection('property').findOne({
    _id: firstPasskeyProp._id,
    type: 'entu_passkey',
    deleted: { $exists: false }
  })

  if (!propertyDoc?.passkey_public) {
    throw createError({ statusCode: 400, statusMessage: 'Public key not found in property document' })
  }

  const authenticatorData = {
    credentialID: Buffer.from(propertyDoc.passkey_id, 'base64url'),
    credentialPublicKey: Buffer.from(propertyDoc.passkey_public, 'base64url'),
    counter: propertyDoc.passkey_counter || 0
  }

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
    throw createError({ statusCode: 400, statusMessage: 'Authentication verification failed' })
  }

  const newCounter = verification.authenticationInfo?.newCounter ?? authenticatorData.counter + 1

  // Update counter in all matching databases in parallel
  await Promise.all(
    dbMatches.map(async ({ dbName, db, user }) => {
      await db.collection('property').updateMany(
        { entity: user._id, type: 'entu_passkey', passkey_id: credentialId, deleted: { $exists: false } },
        { $set: { passkey_counter: newCounter } }
      )

      await aggregateEntity({ account: dbName, user: user._id, userStr: user._id.toString(), db }, user._id)
    })
  )

  const accountUsersIds = Object.fromEntries(dbMatches.map(({ dbName, user }) => [dbName, user._id.toString()]))

  return {
    accounts: dbMatches.map(({ dbName, user }) => ({
      _id: dbName,
      name: dbName,
      user: {
        _id: user._id.toString(),
        name: user.private?.name?.at(0)?.string || user._id.toString()
      }
    })),
    token: jwt.sign({ accounts: accountUsersIds }, jwtSecret, { audience, expiresIn: '48h' })
  }
})
