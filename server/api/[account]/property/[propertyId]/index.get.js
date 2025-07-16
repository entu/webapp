defineRouteMeta({
  openAPI: {
    tags: ['Property'],
    description: 'Get property details or redirect to file download URL',
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
        name: 'propertyId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          description: 'Property ID'
        }
      },
      {
        name: 'download',
        in: 'query',
        schema: {
          type: 'string',
          description: 'If set and property is a file, redirects to file download URL'
        }
      }
    ],
    responses: {
      200: {
        description: 'Property details with creation metadata',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  description: 'Property ID',
                  example: '6798938532faaba00f8fc761'
                },
                type: {
                  type: 'string',
                  description: 'Property type',
                  example: 'manufacturer'
                },
                string: {
                  type: 'string',
                  description: 'String value (if property type is string)',
                  example: 'Prusament'
                },
                number: {
                  type: 'number',
                  description: 'Numeric value (if property type is number)'
                },
                boolean: {
                  type: 'boolean',
                  description: 'Boolean value (if property type is boolean)'
                },
                reference: {
                  type: 'string',
                  description: 'Reference to another entity (if property type is reference)'
                },
                date: {
                  type: 'string',
                  format: 'date',
                  description: 'Date value (if property type is date)'
                },
                datetime: {
                  type: 'string',
                  format: 'date-time',
                  description: 'DateTime value (if property type is datetime)'
                },
                filename: {
                  type: 'string',
                  description: 'File name (if property type is file)'
                },
                filesize: {
                  type: 'integer',
                  description: 'File size in bytes (if property type is file)'
                },
                filetype: {
                  type: 'string',
                  description: 'MIME type (if property type is file)'
                },
                language: {
                  type: 'string',
                  description: 'Language code for multilingual properties'
                },
                entity: {
                  type: 'string',
                  description: 'Entity ID this property belongs to',
                  example: '6798938532faaba00f8fc75f'
                },
                created: {
                  type: 'object',
                  description: 'Property creation metadata',
                  properties: {
                    at: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Creation timestamp',
                      example: '2025-01-28T08:21:25.637Z'
                    },
                    by: {
                      type: 'string',
                      description: 'ID of user who created the property',
                      example: '506e7c33dcb4b5c4fde735d0'
                    }
                  },
                  required: ['at', 'by']
                }
              },
              required: ['_id', 'type', 'entity', 'created']
            }
          }
        }
      },
      302: {
        description: 'Redirect to file download URL (when download parameter is set and property is a file)'
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
        description: 'Forbidden - Insufficient permissions to view property',
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
        description: 'Property not found',
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
