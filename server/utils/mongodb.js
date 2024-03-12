import { MongoClient, ObjectId } from 'mongodb'

export const mongoDbSystemDbs = ['admin', 'config', 'local']

const dbClient = new MongoClient(process.env.NUXT_MONGODB_URL)
const dbConnections = {}
let dbConnection

export async function connectDb (dbName) {
  if (!dbName) return

  if (dbConnections[dbName]) {
    return dbConnections[dbName]
  }

  if (!dbConnection) {
    dbConnection = await dbClient.connect()
    console.log('Connected to MongoDB')
  }

  const dbs = await dbConnection.db().admin().listDatabases()
  const dbNames = dbs.databases.map(db => db.name)

  if (!dbNames.includes(dbName) || mongoDbSystemDbs.includes(dbName)) {
    console.log(`Database ${dbName} not found`)

    throw createError({
      statusCode: 404,
      statusMessage: `Account ${dbName} not found`
    })
  }

  dbConnections[dbName] = dbConnection.db(dbName)
  console.log(`Connected to ${dbName} database`)

  return dbConnections[dbName]
}

export function getObjectId (_id) {
  return new ObjectId(_id)
}

export async function addUserSession (user) {
  const jwtSecret = await this.ssmParameter('jwt-secret')

  return new Promise((resolve, reject) => {
    if (!user) return reject(new Error('No user'))

    const session = {
      created: new Date(),
      user
    }

    this.db('entu').then((connection) => {
      connection.collection('session').insertOne(_pickBy(session, _identity)).then((result) => {
        const token = jwt.sign({}, jwtSecret, {
          audience: user.ip,
          subject: result.insertedId.toString(),
          expiresIn: '5m'
        })

        resolve(token)
      }).catch((err) => {
        reject(err)
      })
    }).catch((err) => {
      reject(err)
    })
  })
}
