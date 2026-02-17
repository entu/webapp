defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Duplicate entity with optional property filtering and multiple copies',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'db',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          description: 'Database name'
        }
      },
      {
        name: '_id',
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
                default: 1,
                minimum: 1,
                maximum: 100
              },
              ignoredProperties: {
                type: 'array',
                items: { type: 'string' },
                description: 'Property types to ignore during duplication (e.g., ["unique_id", "created_at"])'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Entity duplicated successfully',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              description: 'Array of created entities with their properties',
              items: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string',
                    description: 'New entity ID',
                    example: '6798938432faaba00f8fc72f'
                  },
                  properties: {
                    type: 'object',
                    description: 'Entity properties indexed by property name',
                    additionalProperties: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', description: 'Property ID' },
                          string: { type: 'string', description: 'String value' },
                          number: { type: 'number', description: 'Numeric value' },
                          boolean: { type: 'boolean', description: 'Boolean value' },
                          reference: { type: 'string', description: 'Reference to another entity' }
                        }
                      }
                    }
                  }
                },
                required: ['_id', 'properties']
              }
            }
          }
        }
      },
      401: {
        description: 'Unauthorized - Invalid or missing JWT token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 401 },
                statusMessage: { type: 'string', example: 'Unauthorized' }
              }
            }
          }
        }
      },
      403: {
        description: 'Forbidden - Insufficient permissions to duplicate entity',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 403 },
                statusMessage: { type: 'string', example: 'Forbidden' }
              }
            }
          }
        }
      },
      404: {
        description: 'Entity not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 404 },
                statusMessage: { type: 'string', example: 'Not Found' }
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

  const entityId = getObjectId(getRouterParam(event, '_id'))

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
    type: { $nin: [...ignoredProperties, '_created', '_mid', 'entu_api_key', 'entu_user', 'entu_passkey'] }
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
