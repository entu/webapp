import { MongoClient } from 'mongodb'

let dbConnection

export async function connectDb (dbName) {
  if (!dbConnection) {
    const dbClient = new MongoClient(process.env.NUXT_MONGODB_URL)

    dbConnection = await dbClient.connect()

    console.log('Connected to MongoDB')
  }

  return dbConnection.db(dbName)
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
