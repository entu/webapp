defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Get entity change history (changelog) showing all modifications over time',
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
          description: 'Entity ID'
        }
      }
    ],
    responses: {
      200: {
        description: 'Entity change history',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              description: 'Array of history entries showing entity changes',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', description: 'History entry ID' },
                  entity: { type: 'string', description: 'Entity ID' },
                  property: { type: 'string', description: 'Property ID that was changed' },
                  action: { type: 'string', enum: ['create', 'update', 'delete'], description: 'Action performed' },
                  user: { type: 'string', description: 'User who made the change' },
                  timestamp: { type: 'string', format: 'date-time', description: 'When the change occurred' },
                  before: { type: 'object', description: 'Property value before change' },
                  after: { type: 'object', description: 'Property value after change' }
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
        description: 'Forbidden - Insufficient permissions to view entity history',
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

  const entityId = getObjectId(getRouterParam(event, '_id'))
  const entity = await entu.db.collection('entity').findOne({
    _id: entityId
  }, {
    projection: {
      _id: false,
      access: true
    }
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: `Entity ${entityId} not found`
    })
  }

  const access = entity.access?.map((s) => s.toString()) || []

  if (!access.includes(entu.userStr)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User not in any rights property'
    })
  }

  const changes = await entu.db.collection('property').aggregate([
    {
      $match: {
        entity: entityId,
        type: { $nin: ['_mid', '_created'] }
      }
    }, {
      $project: {
        type: '$type',
        at: '$created.at',
        by: '$created.by',
        new: {
          boolean: '$boolean',
          date: '$date',
          datetime: '$datetime',
          filename: '$filename',
          filesize: '$filesize',
          md5: '$md5',
          number: '$number',
          reference: '$reference',
          string: '$string'
        }
      }
    }, {
      $unionWith: {
        coll: 'property',
        pipeline: [
          {
            $match: {
              entity: entityId,
              deleted: { $exists: true },
              type: {
                $nin: ['_mid', '_created']
              }
            }
          }, {
            $project: {
              type: '$type',
              at: '$deleted.at',
              by: '$deleted.by',
              old: {
                boolean: '$boolean',
                date: '$date',
                datetime: '$datetime',
                filename: '$filename',
                filesize: '$filesize',
                md5: '$md5',
                number: '$number',
                reference: '$reference',
                string: '$string'
              }
            }
          }
        ]
      }
    }, {
      $group: {
        _id: { type: '$type', at: '$at', by: '$by' },
        type: { $max: '$type' },
        at: { $max: '$at' },
        by: { $max: '$by' },
        old: { $max: '$old' },
        new: { $max: '$new' }
      }
    }, {
      $project: { _id: false }
    }, {
      $sort: { at: 1 }
    }
  ]).toArray()

  const cleanChanges = changes.map((x) => {
    if (x.type === 'entu_api_key') {
      if (x.old.string) x.old.string = '***'
      if (x.new.string) x.new.string = '***'
    }

    if (x.type === 'entu_passkey') {
      if (x.old.string) x.old.string = `${x.old.passkey_device || ''} ${x._id.toString().slice(-4).toUpperCase()}`.trim()
      if (x.new.string) x.new.string = `${x.new.passkey_device || ''} ${x._id.toString().slice(-4).toUpperCase()}`.trim()
    }

    if (x.at === null) delete x.at
    if (x.by === null) delete x.by
    if (x.old === null) delete x.old
    if (x.new === null) delete x.new

    return x
  })

  return cleanChanges
})
