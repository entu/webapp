export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('afterResponse', async (event) => {
    const date = new Date().toISOString()
    const entu = event.context.entu
    const path = event.path.split('?').at(0).replace('/api', '').replace(`/${entu.account}`, '')
    const query = getQuery(event)
    const queryStr = new URLSearchParams(query).toString()

    await indexOpenSearchDb('entu-requests', {
      '@timestamp': date,
      db: entu?.account,
      user: !entu?.systemUser && entu?.userStr ? entu?.userStr : undefined,
      method: event.method,
      path: path ? path : undefined,
      query: queryStr ? queryStr : undefined
    })

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
