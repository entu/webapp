export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  const entity = await entu.db.collection('entity').findOne({
    _id: entu._id
  }, {
    projection: {
      _id: false,
      'private._owner': true
    }
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Entity not found'
    })
  }

  const access = (entity.private?._owner || []).map(s => s.reference?.toString())

  if (!access.includes(entu.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User not in _owner property'
    })
  }

  await entu.db.collection('property').insertOne({
    entity: entu._id,
    type: '_deleted',
    reference: entu.user,
    datetime: new Date(),
    created: {
      at: new Date(),
      by: entu.user
    }
  })
  await addEntityAggregateSqs(entu._id)

  const properties = await entu.db.collection('property').find({
    reference: entu._id,
    deleted: { $exists: false }
  }, {
    projection: {
      entity: true,
      type: true
    }
  }).toArray()

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]

    await entu.db.collection('property').updateOne({
      _id: property._id
    }, {
      $set: {
        deleted: {
          at: new Date(),
          by: entu.user
        }
      }
    })

    await addEntityAggregateSqs(property.entity)
  }

  return { deleted: true }
})
