import { MongoClient } from 'mongodb'

let dbConnection

export default defineEventHandler(async (event) => {
  const { mongoUrl } = useRuntimeConfig(event)

  event.context.db = await connectDB(mongoUrl, event.context.auth.account)
})

async function connectDB (mongoUrl, dbName) {
  if (!dbConnection) {
    const dbClient = new MongoClient(mongoUrl)

    dbConnection = await dbClient.connect()

    console.log('Connected to MongoDB')
  }

  return dbConnection.db(dbName)
}
