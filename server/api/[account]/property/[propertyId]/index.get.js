export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  const propertyId = getObjectId(getRouterParam(event, 'propertyId'))

  const property = await entu.db.collection('property').findOne({
    _id: propertyId,
    deleted: { $exists: false }
  })

  if (!property) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Property not found'
    })
  }

  const entity = await entu.db.collection('entity').findOne({
    _id: property.entity
  }, {
    projection: {
      _id: false,
      access: true,
      [`public.${property.type}._id`]: true
    }
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: `Entity ${property.entity} not found`
    })
  }

  const publicProperty = entity.public?.[property.type]?.some((x) => x._id.toString() === propertyId.toString())
  const access = entity.access?.map((s) => s.toString()) || []

  if (publicProperty) {
    if (!access.includes('public')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Not a public property'
      })
    }
  }
  else if (!access.includes(entu.userStr)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User not in any rights property'
    })
  }

  if (property.filename) {
    property.url = await getSignedDownloadUrl(entu.account, property.entity, property)
  }

  if (property.type === 'entu_api_key') {
    property.string = '***'
  }

  if (property.url && getQuery(event).download) {
    await sendRedirect(event, property.url, 302)
  }
  else {
    return property
  }
})
