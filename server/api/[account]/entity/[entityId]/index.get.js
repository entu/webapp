defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Get single entity with all its properties and metadata',
    security: [{ bearerAuth: [] }],
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
          description: 'Comma-separated list of properties to include. If not set, all properties are returned.'
        }
      }
    ],
    responses: {
      200: {
        description: 'Entity with all properties in flattened structure',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                entity: {
                  type: 'object',
                  description: 'Entity with flattened properties structure',
                  properties: {
                    _id: {
                      type: 'string',
                      description: 'Entity ID',
                      example: '6798938432faaba00f8fc72f'
                    },
                    _type: {
                      type: 'array',
                      description: 'Entity type information',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', description: 'Property ID' },
                          reference: { type: 'string', description: 'Reference to entity type definition' },
                          string: { type: 'string', description: 'Entity type name', example: 'filament' }
                        }
                      }
                    },
                    _owner: {
                      type: 'array',
                      description: 'Entity owners',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', description: 'Property ID' },
                          reference: { type: 'string', description: 'Reference to owner entity' },
                          string: { type: 'string', description: 'Owner name' }
                        }
                      }
                    },
                    _created: {
                      type: 'array',
                      description: 'Creation information',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', description: 'Property ID' },
                          reference: { type: 'string', description: 'Reference to creator' },
                          datetime: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
                          string: { type: 'string', description: 'Creator name' }
                        }
                      }
                    },
                    _sharing: {
                      type: 'array',
                      description: 'Sharing settings',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', description: 'Property ID' },
                          string: { type: 'string', enum: ['public', 'private'], description: 'Sharing level' }
                        }
                      }
                    },
                    _thumbnail: {
                      type: 'string',
                      description: 'Thumbnail URL (if entity has photos)',
                      example: 'https://entu-files.fra1.digitaloceanspaces.com/...'
                    }
                  },
                  additionalProperties: {
                    type: 'array',
                    description: 'Dynamic properties based on entity type',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', description: 'Property ID' },
                        string: { type: 'string', description: 'String value' },
                        number: { type: 'number', description: 'Numeric value' },
                        boolean: { type: 'boolean', description: 'Boolean value' },
                        reference: { type: 'string', description: 'Reference to another entity' },
                        date: { type: 'string', format: 'date', description: 'Date value' },
                        datetime: { type: 'string', format: 'date-time', description: 'DateTime value' },
                        filename: { type: 'string', description: 'File name for file properties' },
                        filesize: { type: 'integer', description: 'File size in bytes' },
                        filetype: { type: 'string', description: 'MIME type of file' },
                        language: { type: 'string', description: 'Language code for multilingual properties' }
                      }
                    }
                  }
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
        description: 'Forbidden - Insufficient permissions to view entity',
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
