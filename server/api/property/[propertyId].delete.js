const rightTypes = [
  '_noaccess',
  '_viewer',
  '_expander',
  '_editor',
  '_owner',
  '_public',
  '_parent',
  '_inheritrights'
]

export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  const property = await entu.db.collection('property').findOne({
    _id: entu._id,
    deleted: { $exists: false }
  }, {
    projection: {
      _id: false,
      entity: true,
      type: true
    }
  })

  if (!property) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Property not found'
    })
  }

  if (property.type.startsWith('_') && !rightTypes.includes(property.type)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Can\'t delete system property'
    })
  }

  const entity = await entu.db.collection('entity').findOne({
    _id: property.entity
  }, {
    projection: {
      _id: false,
      'private._editor': true,
      'private._owner': true
    }
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Entity not found'
    })
  }

  const access = (entity.private?._editor || []).map(s => s.reference?.toString())

  if (!access.includes(entu.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User not in _owner nor _editor property'
    })
  }

  const owners = (entity.private?._owner || []).map(s => s.reference?.toString())

  if (rightTypes.includes(property.type) && !owners.includes(entu.user)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User not in _owner property'
    })
  }

  await entu.db.collection('property').updateOne({
    _id: entu._id
  }, {
    $set: {
      deleted: {
        at: new Date(),
        by: entu.user
      }
    }
  })

  await addEntityAggregateSqs(property.entity)

  return { deleted: true }
})
