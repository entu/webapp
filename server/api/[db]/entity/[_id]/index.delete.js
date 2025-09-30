defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Delete entity and all its properties permanently',
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
          description: 'Entity ID to delete'
        }
      }
    ],
    responses: {
      200: {
        description: 'Entity successfully deleted',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                acknowledged: {
                  type: 'boolean',
                  description: 'Deletion acknowledgment',
                  example: true
                },
                deletedCount: {
                  type: 'integer',
                  description: 'Number of entities deleted',
                  example: 1
                }
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
        description: 'Forbidden - Insufficient permissions to delete entity',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 403 },
                statusMessage: { type: 'string', example: 'No user' }
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

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  const entityId = getObjectId(getRouterParam(event, '_id'))

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

  await triggerWebhooks(entu, entityId, 'entity-delete-webhook')

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
