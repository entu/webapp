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

    console.log('Connected to MongoDB')
  }

  const dbs = await dbConnection.db().admin().listDatabases()
  const dbNames = dbs.databases.map((db) => db.name)

  if (mongoDbSystemDbs.includes(dbName)) {
    console.log(`Database "${dbName}" is a system database`)

    throw createError({
      statusCode: 400,
      statusMessage: `Account ${dbName} not found`
    })
  }

  if (!isNew && !dbNames.includes(dbName)) {
    console.log(`Database "${dbName}" not found`)

    throw createError({
      statusCode: 404,
      statusMessage: `Account ${dbName} not found`
    })
  }

  dbConnections[dbName] = dbConnection.db(dbName)
  console.log(`Connected to database "${dbName}"`)

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
