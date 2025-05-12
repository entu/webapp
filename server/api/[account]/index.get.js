export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const date = new Date().toISOString()

  const [
    stats,
    database,
    entities,
    deletedEntities,
    properties,
    deletedProperties,
    files,
    deletedFiles,
    requests
  ] = await Promise.all([
    entu.db.stats(),
    entu.db.collection('entity').findOne({ 'private._type.string': 'database' }, {
      projection: {
        'private.name.string': true,
        'private.billing_entities_limit.number': true,
        'private.billing_data_limit.number': true,
        'private.billing_requests_limit.number': true
      }
    }),
    entu.db.collection('entity').countDocuments(),
    entu.db.collection('property').aggregate([
      { $match: { type: '_deleted' } },
      { $group: { _id: '$entity' } },
      { $count: 'count' }
    ]).toArray(),
    entu.db.collection('property').countDocuments({ deleted: { $exists: false } }),
    entu.db.collection('property').countDocuments({ deleted: { $exists: true } }),
    entu.db.collection('property').aggregate([
      { $match: { deleted: { $exists: false }, filesize: { $exists: true } } },
      { $lookup: { from: 'entity', localField: 'entity', foreignField: '_id', as: 'entities' } },
      { $match: { entities: { $not: { $size: 0 } } } },
      { $group: { _id: null, count: { $sum: 1 }, filesize: { $sum: '$filesize' } } }
    ]).toArray(),
    entu.db.collection('property').aggregate([
      { $match: { filesize: { $exists: true } } },
      { $lookup: { from: 'entity', localField: 'entity', foreignField: '_id', as: 'entities' } },
      { $match: { $or: [{ entities: { $size: 0 } }, { deleted: { $exists: true } }] } },
      { $group: { _id: null, count: { $sum: 1 }, filesize: { $sum: '$filesize' } } }
    ]).toArray(),
    entu.db.collection('stats').findOne({ date: date.substring(0, 7), function: 'ALL' })
  ])

  return {
    entities: {
      usage: entities,
      deleted: deletedEntities?.at(0)?.count || 0,
      limit: database?.private?.billing_entities_limit?.at(0)?.number || 0
    },
    properties: {
      usage: properties || 0,
      deleted: deletedProperties || 0
    },
    requests: {
      usage: requests?.count || 0,
      // limit: database?.private?.billing_requests_limit?.at(0)?.number || 0
      limit: Math.ceil(requests?.count / Math.pow(10, requests?.count.toString().length - 1)) * Math.pow(10, requests?.count.toString().length - 1) || 0
    },
    files: {
      usage: files?.at(0)?.filesize || 0,
      deleted: deletedFiles?.at(0)?.filesize || 0,
      limit: (database?.private?.billing_data_limit?.at(0)?.number || 0) * 1e9
    },
    dbSize: stats.dataSize + stats.indexSize
  }
})
