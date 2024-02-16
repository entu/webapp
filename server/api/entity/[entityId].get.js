export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const query = getQuery(event)

  const props = (query.props || '').split(',').filter(x => !!x)
  const fields = {}
  let getThumbnail = props.length === 0

  if (props.length > 0) {
    props.forEach((f) => {
      if (f === '_thumbnail') {
        fields['private.photo.s3'] = true
        fields['public.photo.s3'] = true
        getThumbnail = true
      } else {
        fields[`private.${f}`] = true
        fields[`public.${f}`] = true
      }
    })
    fields.access = true
  }

  const entity = await entu.db.collection('entity').findOne({
    _id: entu._id
  }, {
    projection: fields
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Entity not found'
    })
  }

  const cleanedEntity = await claenupEntity(entity, user, getThumbnail)

  if (!cleanedEntity) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No accessible properties'
    })
  }

  return {
    entity: cleanedEntity
  }
})
