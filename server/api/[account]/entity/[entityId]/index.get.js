export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const query = getQuery(event)

  const props = (query.props || '').split(',').filter(x => !!x)
  const fields = {}
  let getThumbnail = props.length === 0

  if (props.length > 0) {
    props.forEach((f) => {
      if (f === '_thumbnail') {
        fields['private.photo'] = true
        fields['public.photo'] = true
        getThumbnail = true
      } else {
        fields[`private.${f}`] = true
        fields[`public.${f}`] = true
        fields[`domain.${f}`] = true
      }
    })
    fields.access = true
  }

  const entityId = getObjectId(getRouterParam(event, 'entityId'))

  const entity = await entu.db.collection('entity').findOne({
    _id: entityId
  }, {
    projection: fields
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: `Entity ${entityId} not found`
    })
  }

  const cleanedEntity = await cleanupEntity(entu, entity, getThumbnail)

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
