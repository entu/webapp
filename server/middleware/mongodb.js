import { MongoClient } from 'mongodb'

let dbConnection

export default defineEventHandler(async (event) => {
  const { mongodbUrl } = useRuntimeConfig(event)

  event.context.entu.db = await connectDB(mongodbUrl, event.context.entu.account)
})

async function connectDB (mongodbUrl, dbName) {
  if (!dbConnection) {
    const dbClient = new MongoClient(mongodbUrl)

    dbConnection = await dbClient.connect()

    console.log('Connected to MongoDB')
  }

  return dbConnection.db(dbName)
}
