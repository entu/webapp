import { createHash } from 'crypto'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

const mongoDbSystemDbs = ['admin', 'config', 'local']

export default defineEventHandler(async (event) => {
  const { jwtSecret } = useRuntimeConfig(event)
  const key = getHeader(event, 'authorization').replace('Bearer ', '')

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No key'
    })
  }

  const authFilter = {}
  const connection = await connectDb('entu')
  const audience = getRequestIP(event, { xForwardedFor: true })

  try {
    const decoded = jwt.verify(key, jwtSecret, { audience })
    const session = await connection.collection('session').findOneAndUpdate({
      _id: new ObjectId(decoded.sub),
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
  } catch (e) {
    authFilter['private.entu_api_key.string'] = createHash('sha256').update(key).digest('hex')
  }

  const onlyForAccount = getQuery(event)?.account

  const dbs = await connection.admin().listDatabases()
  const accounts = {}

  for (let i = 0; i < dbs.databases.length; i++) {
    const account = dbs.databases[i].name
    if (onlyForAccount && onlyForAccount !== account) { continue }
    if (mongoDbSystemDbs.includes(account)) { continue }

    const accountCon = await connectDb(account)
    const person = await accountCon.collection('entity').findOne(authFilter, { projection: { _id: true, 'private.name.string': true } })

    if (person) {
      const token = jwt.sign({}, jwtSecret, {
        issuer: account,
        audience,
        subject: person._id.toString(),
        expiresIn: '48h'
      })

      accounts[account] = {
        _id: person._id.toString(),
        name: person.private?.name?.at(0)?.string,
        account,
        token
      }
    }
  }

  return Object.values(accounts)
})
