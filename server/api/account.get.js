export default defineEventHandler(async ({ context }) => {
  // await _h.addStats(event, context.db.functionName)

  const stats = await context.db.stats()

  const entities = await context.db.collection('entity').countDocuments()
  const deletedEntities = await context.db.collection('property').aggregate([{
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

  const properties = await context.db.collection('property').aggregate([{
    $group: {
      _id: { $gt: ['$deleted', null] },
      count: { $sum: 1 }
    }
  }]).toArray()

  const files = await context.db.collection('property').aggregate([{
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

  const date = new Date().toISOString()
  const requests = await context.db.collection('stats').findOne({ date: date.substring(0, 7), function: 'ALL' })

  return {
    entities,
    deletedEntities: deletedEntities?.at(0)?.count || 0,
    properties: properties.find(e => e._id === false)?.count || 0,
    deletedProperties: properties.find(e => e._id === true)?.count || 0,
    files: files.find(e => e._id === false)?.count || 0,
    filesSize: files.find(e => e._id === false)?.filesize || 0,
    deletedFiles: files.find(e => e._id === true)?.count || 0,
    deletedFilesSize: files.find(e => e._id === true)?.filesize || 0,
    dbSize: stats.dataSize + stats.indexSize,
    requestsMonth: requests?.count || 0
  }
})
