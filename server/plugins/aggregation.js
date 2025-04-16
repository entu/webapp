export default defineNitroPlugin(async () => {
  const { runAggregation } = useRuntimeConfig()

  while (runAggregation) {
    await aggregate()
    await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait 3 seconds
  }
})

async function aggregate () {
  const db = await connectDb('entu')
  const mongoDatabases = await db.admin().listDatabases()
  const databases = mongoDatabases.databases.filter((db) => !['admin', 'config', 'local'].includes(db.name)).map((db) => db.name)

  console.log(`Aggregate ${databases.length} databases`)
  await Promise.all(databases.map(aggregateDb))
}

async function aggregateDb (database) {
  const db = await connectDb(database)
  const entities = await db.collection('entity')
    .find({ queued: { $exists: true } }, { projection: { _id: true } })
    .sort({ queued: 1 })
    .limit(100)
    .toArray()

  if (entities.length === 0) return

  const entu = {
    account: database,
    db,
    systemUser: true
  }
  let count = 0

  await Promise.all(
    entities.map(async ({ _id }) => {
      try {
        await aggregateEntity(entu, _id)
        count++
      }
      catch (error) {
        console.error(`Failed to aggregate entity ${_id} in ${database}:`, error)
      }
    })
  )

  console.log(`Aggregated ${database} - ${entities.length}/${count} entities`)
}
