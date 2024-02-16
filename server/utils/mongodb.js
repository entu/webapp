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
