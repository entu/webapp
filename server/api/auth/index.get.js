import { createHash } from 'crypto'
import jwt from 'jsonwebtoken'

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
  } catch (e) {
    authFilter['private.entu_api_key.string'] = createHash('sha256').update(key).digest('hex')
  }

  const onlyForAccount = getQuery(event).account

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

  if (!onlyForAccount && accounts.length === 0) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No accounts'
    })
  } else if (onlyForAccount && accounts.length === 0 && session) {
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
    } else {
      throw createError({
        statusCode: 403,
        statusMessage: 'No account'
      })
    }
  }

  const token = jwt.sign({ accounts: accountUsersIds }, jwtSecret, {
    audience,
    expiresIn: '48h'
  })

  setCookie(event, 'token', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 48,
    secure: true,
    sameSite: 'Strict'
  })

  return {
    accounts,
    token
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
