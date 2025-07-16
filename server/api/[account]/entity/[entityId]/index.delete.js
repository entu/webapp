defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Delete entity',
    parameters: [
      {
        name: 'account',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          description: 'Account ID'
        }
      },
      {
        name: 'entityId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          description: 'Entity ID'
        }
      }
    ]
  }
})

export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  const entityId = getObjectId(getRouterParam(event, 'entityId'))

  const entity = await entu.db.collection('entity').findOne({
    _id: entityId
  }, {
    projection: {
      _id: false,
      'private._owner': true
    }
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: `Entity ${entityId} not found`
    })
  }

  const access = entity.private?._owner?.map((s) => s.reference?.toString()) || []

  if (!access.includes(entu.userStr)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User not in _owner property'
    })
  }

  await entu.db.collection('property').insertOne({
    entity: entityId,
    type: '_deleted',
    reference: entu.user,
    datetime: new Date(),
    created: {
      at: new Date(),
      by: entu.user
    }
  })

  await aggregateEntity(entu, entityId)

  const referrers = await entu.db.collection('property').aggregate([
    { $match: { reference: entityId, deleted: { $exists: false } } },
    { $group: { _id: '$entity' } }
  ]).toArray()

  const referrerIds = referrers.map((x) => x._id)

  await entu.db.collection('property').updateMany({
    reference: entityId,
    deleted: { $exists: false }
  }, {
    $set: {
      deleted: {
        at: new Date(),
        by: entu.user
      }
    }
  })

  await addAggregateQueue(entu, referrerIds)

  return { deleted: true }
})
