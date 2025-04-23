export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('afterResponse', async (event, { body }) => {
    const date = new Date().toISOString()
    const entu = event.context.entu
    const messageTags = [
      `method:${event.method.toLowerCase()}`,
      `path:${event.path.split('?').at(0).replace(`/api/${entu.account}`, '')}`,
      event.path.split('?').at(1) ? `query:${decodeURIComponent(event.path.split('?').at(1))}` : undefined
    ]

    logger(undefined, entu, messageTags.filter(Boolean))

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
      )
      // entu.db.collection('stats').updateOne(
      //   { date: date.substring(0, 10), function: functionName },
      //   { $inc: { count: 1 } },
      //   { upsert: true }
      // ),
      // entu.db.collection('stats').updateOne(
      //   { date: date.substring(0, 7), function: functionName },
      //   { $inc: { count: 1 } },
      //   { upsert: true }
      // ),
      // entu.db.collection('stats').updateOne(
      //   { date: date.substring(0, 4), function: functionName },
      //   { $inc: { count: 1 } },
      //   { upsert: true }
      // )
    ])
  })
})
