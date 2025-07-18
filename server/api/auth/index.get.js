import { createHash } from 'node:crypto'
import jwt from 'jsonwebtoken'

defineRouteMeta({
  openAPI: {
    tags: ['Authentication'],
    description: 'Authenticates user by API key. Returns array of objects containing JWT tokens for accessing databases where user exists.',
    security: [], // Uses API key, not JWT
    parameters: [
      {
        name: 'authorization',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          description: 'Bearer token (temporary API key or permanent API key)',
          example: 'Bearer nEkPYET5fYjJqktNz9yfLxPF'
        }
      },
      {
        name: 'db',
        in: 'query',
        schema: {
          type: 'string',
          description: 'Database name. Optional. If set, authentication is done only for this database.'
        }
      }
    ],
    responses: {
      200: {
        description: 'Authentication data with JWT tokens',
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
                      _id: { type: 'string', description: 'Database ID', example: 'mydatabase' },
                      name: { type: 'string', description: 'Database name', example: 'mydatabase' },
                      user: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', description: 'User ID', example: 'npfwb8fv4ku7tzpq5yjarncc' },
                          name: { type: 'string', description: 'User name', example: 'User 1' }
                        }
                      }
                    }
                  }
                },
                user: {
                  type: 'object',
                  description: 'User information',
                  properties: {
                    name: { type: 'string', description: 'User name' },
                    email: { type: 'string', description: 'User email' },
                    picture: { type: 'string', description: 'User picture URL' }
                  }
                },
                token: {
                  type: 'string',
                  description: 'JWT token for API access',
                  example: 'hNGcQgaeKh7ptWF5FVPbfKgpR5ZHCzT5cbA4BQWtmWGkfdQHg5HLDMCB8GwKw8gG'
                }
              }
            }
          }
        }
      },
      400: {
        description: 'No API key provided',
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
      },
      401: {
        description: 'Invalid API key',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 401 },
                statusMessage: { type: 'string', example: 'Unauthorized' }
              }
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const { jwtSecret } = useRuntimeConfig(event)
  const key = (getHeader(event, 'authorization') || '').replace('Bearer ', '').trim()

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No key'
    })
  }

  const authFilter = {}
  const connection = await connectDb('entu')
  const audience = getRequestIP(event, { xForwardedFor: true })
  let session

  try {
    const decoded = jwt.verify(key, jwtSecret, { audience })
    session = await connection.collection('session').findOneAndUpdate({
      _id: getObjectId(decoded.sub),
      deleted: { $exists: false }
    }, {
      $set: { deleted: new Date() }
    })

    if (!session) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No session'
      })
    }

    if (!session.user?.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No user email'
      })
    }

    authFilter['private.entu_user.string'] = session.user.email
  }
  catch (e) {
    authFilter['private.entu_api_key.string'] = createHash('sha256').update(key).digest('hex')
  }

  const query = getQuery(event)
  const onlyForAccount = query.db || query.account

  const dbs = await connection.admin().listDatabases()
  const accounts = []
  const accountUsersIds = {}

  for (let i = 0; i < dbs.databases.length; i++) {
    const account = dbs.databases[i].name

    if (onlyForAccount && onlyForAccount !== account) { continue }
    if (mongoDbSystemDbs.includes(account)) { continue }

    const accountCon = await connectDb(account)
    const person = await accountCon.collection('entity').findOne(authFilter, { projection: { _id: true, 'private.name.string': true } })

    if (person) {
      accountUsersIds[account] = person._id.toString()
      accounts.push({
        _id: account,
        name: account,
        user: {
          _id: person._id.toString(),
          name: person.private?.name?.at(0).string || person._id.toString()
        }
      })
    }
  }

  if (onlyForAccount && accounts.length === 0 && session) {
    const person = await createUserForAccount(onlyForAccount, session)

    if (person) {
      accountUsersIds[onlyForAccount] = person._id.toString()
      accounts.push({
        _id: onlyForAccount,
        name: onlyForAccount,
        user: {
          _id: person._id,
          name: person.name,
          new: true
        }
      })
    }
  }

  const userData = {}
  const tokenData = {}

  if (session?.user?.email || session?.user?.name) {
    userData.email = session?.user?.email
    userData.name = session?.user?.name

    tokenData.user = userData
  }

  if (accounts.length > 0) {
    tokenData.accounts = accountUsersIds
  }

  return {
    accounts,
    user: userData,
    token: jwt.sign(tokenData, jwtSecret, {
      audience,
      expiresIn: '48h'
    })
  }
})

async function createUserForAccount (account, session) {
  if (!account || !session) return

  const entu = {
    account,
    db: await connectDb(account),
    systemUser: true
  }

  const database = await entu.db.collection('entity').findOne({ 'private._type.string': 'database', 'private.add_user.reference': { $exists: true } }, { projection: { 'private.add_user.reference': true } })

  const parent = database?.private?.add_user?.at(0)?.reference

  if (!parent) return

  const type = await entu.db.collection('entity').findOne({ 'private._type.string': 'entity', 'private.name.string': 'person' }, { projection: { _id: true } })

  if (!type?._id) return

  const properties = [
    { type: '_type', reference: type._id },
    { type: '_parent', reference: parent },
    { type: '_inheritrights', boolean: true },
    { type: 'entu_user', string: session.user.email },
    { type: 'email', string: session.user.email }
  ]

  if (session.user.name) {
    properties.push({ type: 'name', string: session.user.name })
  }

  const person = await setEntity(entu, null, properties)

  if (!person._id) return

  await setEntity(entu, person._id, [
    { type: '_editor', reference: person._id }
  ])

  return { _id: person._id, name: session.user.name }
}
