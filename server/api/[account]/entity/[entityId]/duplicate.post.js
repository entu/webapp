import { setEntity } from '~~/server/utils/entity'

defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Duplicate entity',
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
          description: 'Entity ID to duplicate'
        }
      }
    ],
    requestBody: {
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
                description: 'Number of duplicates to create',
                default: 1
              },
              ignoredProperties: {
                type: 'array',
                items: { type: 'string' },
                description: 'Properties to ignore during duplication'
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
  const { count = 1, ignoredProperties = [] } = await readBody(event)

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  const entityId = getObjectId(getRouterParam(event, 'entityId'))

  // Get the original entity (only _owner for permission check)
  const entity = await entu.db.collection('entity').findOne({
    _id: entityId
  }, {
    projection: {
      'private._owner': true
    }
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Entity not found'
    })
  }

  // Check if user is in _owner
  console.log(entity.private?._owner)
  console.log(entu.userStr)

  const isOwner = entity.private?._owner?.some((owner) => owner.reference?.toString() === entu.userStr)

  if (!isOwner) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User must be owner to duplicate entity'
    })
  }

  // Get all non-deleted properties for this entity (excluding ignored properties and sensitive properties)
  const oldProperties = await entu.db.collection('property').find({
    entity: entityId,
    deleted: { $exists: false },
    filename: { $exists: false },
    type: { $nin: [...ignoredProperties, '_created', '_mid', 'entu_api_key', 'entu_user'] }
  }, {
    projection: {
      _id: false,
      entity: false,
      created: false
    }
  }).toArray()

  // Create the duplicate entities
  const createdEntities = []

  for (let i = 0; i < count; i++) {
    const newEntity = await setEntity(entu, null, [...oldProperties])

    createdEntities.push(newEntity)
  }

  return createdEntities
})
