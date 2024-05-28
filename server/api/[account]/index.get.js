export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  const stats = await entu.db.stats()

  const entities = await entu.db.collection('entity').countDocuments()

  const deletedEntities = await entu.db.collection('property').aggregate([{
    $match: {
      type: '_deleted'
    }
  }, {
    $group: {
      _id: '$entity'
    }
  }, {
    $count: 'count'
  }]).toArray()

  const properties = await entu.db.collection('property').aggregate([{
    $group: {
      _id: { $gt: ['$deleted', null] },
      count: { $sum: 1 }
    }
  }]).toArray()

  const files = await entu.db.collection('property').aggregate([{
    $match: {
      filesize: { $exists: true }
    }
  }, {
    $group: {
      _id: { $gt: ['$deleted', null] },
      count: { $sum: 1 },
      filesize: { $sum: '$filesize' }
    }
  }]).toArray()

  const database = await entu.db.collection('entity').findOne({ 'private._type.string': 'database' }, {
    projection: {
      'private.name.string': true,
      'private.billing_entities_limit.number': true,
      'private.billing_data_limit.number': true,
      'private.billing_requests_limit.number': true
    }
  })

  const date = new Date().toISOString()
  const requests = await entu.db.collection('stats').findOne({ date: date.substring(0, 7), function: 'ALL' })

  return {
    entities: {
      usage: entities,
      deleted: deletedEntities?.at(0)?.count || 0,
      limit: database?.private?.billing_entities_limit?.at(0)?.number || 0
    },
    properties: {
      usage: properties.find(e => e._id === false)?.count || 0,
      deleted: properties.find(e => e._id === true)?.count || 0
    },
    requests: {
      usage: requests?.count || 0,
      // limit: database?.private?.billing_requests_limit?.at(0)?.number || 0
      limit: Math.ceil(requests?.count / Math.pow(10, requests?.count.toString().length - 1)) * Math.pow(10, requests?.count.toString().length - 1) || 0
    },
    files: {
      usage: files.find(e => e._id === false)?.filesize || 0,
      deleted: files.find(e => e._id === true)?.filesize || 0,
      limit: (database?.private?.billing_data_limit?.at(0)?.number || 0) * 1e9
    },
    dbSize: stats.dataSize + stats.indexSize
  }
})
