defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Get single entity',
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
      },
      {
        name: 'props',
        in: 'query',
        schema: {
          type: 'string',
          description: 'Comma-separated list of properties to include'
        }
      }
    ],
    responses: {
      200: {
        description: 'Entity details',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _id: { type: 'string', description: 'Entity ID' },
                access: { type: 'array', items: { type: 'string' }, description: 'Access permissions' },
                properties: {
                  type: 'array',
                  items: {
                    type: 'object',
                    description: 'Entity property'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const query = getQuery(event)

  const props = (query.props || '').split(',').filter((x) => !!x)
  const fields = {}
  let getThumbnail = props.length === 0

  if (props.length > 0) {
    props.forEach((f) => {
      if (f === '_thumbnail') {
        fields['private.photo'] = true
        fields['public.photo'] = true
        getThumbnail = true
      }
      else {
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
