export default defineNitroPlugin(async () => {
  const { runAggregation } = useRuntimeConfig()

  while (runAggregation) {
    await aggregate()
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
})

async function aggregate () {
  const db = await connectDb('entu')
  const mongoDatabases = await db.admin().listDatabases()
  const databases = mongoDatabases.databases.filter((db) => !['admin', 'config', 'local'].includes(db.name)).map((db) => db.name)

  await Promise.all(databases.map(aggregateDb))
}

async function aggregateDb (database) {
  const db = await connectDb(database)
  const total = await db.collection('entity')
    .countDocuments({ queued: { $exists: true } })

  const entities = await db.collection('entity')
    .find({ queued: { $exists: true } }, { projection: { _id: true } })
    .sort({ queued: 1 })
    .limit(250)
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
        console.error(`Failed to aggregate "${_id}" in "${database}": ${error.message}`)
      }
    })
  )

  console.log(`Aggregated database "${database}": ${count} of ${total} entities`)
}
