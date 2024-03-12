export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('afterResponse', async (event, { body }) => {
    const date = new Date().toISOString()
    const entu = event.context.entu

    if (!entu?.db) return

    await Promise.all([
      entu.db.collection('stats').updateOne(
        { date: date.substring(0, 10), function: 'ALL' },
        { $inc: { count: 1 } },
        { upsert: true }
      ),
      entu.db.collection('stats').updateOne(
        { date: date.substring(0, 7), function: 'ALL' },
        { $inc: { count: 1 } },
        { upsert: true }
      ),
      entu.db.collection('stats').updateOne(
        { date: date.substring(0, 4), function: 'ALL' },
        { $inc: { count: 1 } },
        { upsert: true }
      ),
      entu.db.collection('stats').updateOne(
        { date: date.substring(0, 10), function: functionName },
        { $inc: { count: 1 } },
        { upsert: true }
      ),
      entu.db.collection('stats').updateOne(
        { date: date.substring(0, 7), function: functionName },
        { $inc: { count: 1 } },
        { upsert: true }
      ),
      entu.db.collection('stats').updateOne(
        { date: date.substring(0, 4), function: functionName },
        { $inc: { count: 1 } },
        { upsert: true }
      )
    ])
  })
})
