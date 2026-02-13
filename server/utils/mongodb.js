import { MongoClient, ObjectId } from 'mongodb'

export const mongoDbSystemDbs = ['admin', 'config', 'local']

const dbConnections = {}
let dbConnection

export async function connectDb (dbName, isNew) {
  if (!dbName) return

  if (dbConnections[dbName]) {
    return dbConnections[dbName]
  }

  if (!dbConnection) {
    const { mongodbUrl } = useRuntimeConfig()
    const dbClient = new MongoClient(mongodbUrl)

    dbConnection = await dbClient.connect()
  }

  const dbs = await dbConnection.db().admin().listDatabases()
  const dbNames = dbs.databases.map((db) => db.name)

  if (mongoDbSystemDbs.includes(dbName)) {
    logger('Database is a system database', { account: dbName })

    throw createError({
      statusCode: 400,
      statusMessage: `Account ${dbName} not found`
    })
  }

  if (!isNew && !dbNames.includes(dbName)) {
    logger('Database not found', { account: dbName })
    throw createError({
      statusCode: 404,
      statusMessage: `Account ${dbName} not found`
    })
  }

  dbConnections[dbName] = dbConnection.db(dbName)
  logger('Connected to database', { account: dbName })

  return dbConnections[dbName]
}

export function getObjectId (_id) {
  return new ObjectId(_id)
}

export function formatDatabaseName (name) {
  if (typeof name !== 'string') return undefined

  let sanitized = name ? name.replace(/[^a-z0-9_]/gi, '').toLowerCase() : undefined
  while (sanitized && (/^[_0-9]/.test(sanitized))) {
    sanitized = sanitized.substring(1)
  }

  if (mongoDbSystemDbs.includes(sanitized)) return undefined

  return sanitized
}
