defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Create new entity with properties. Supports file uploads with signed URLs.',
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
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'array',
            description: 'Array of property objects to create entity with',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', description: 'Property type', example: 'name' },
                string: { type: 'string', description: 'String value', example: 'My Entity Name' },
                number: { type: 'number', description: 'Number value' },
                boolean: { type: 'boolean', description: 'Boolean value' },
                reference: { type: 'string', description: 'Reference to another entity' },
                date: { type: 'string', format: 'date', description: 'Date value' },
                datetime: { type: 'string', format: 'date-time', description: 'DateTime value' },
                language: { type: 'string', description: 'Language code for multilingual properties' }
              },
              required: ['type']
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Created entity with flattened properties structure',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  description: 'Created entity ID',
                  example: '6798938432faaba00f8fc72f'
                },
                properties: {
                  type: 'object',
                  description: 'Created properties indexed by property name',
                  additionalProperties: {
                    type: 'array',
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
      400: {
        description: 'Bad Request - Invalid property data',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 400 },
                statusMessage: { type: 'string', example: 'Bad Request' }
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
        description: 'Forbidden - Insufficient permissions to create entity',
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
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const body = await readBody(event)

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  const { _id, properties } = await setEntity(entu, undefined, body)

  return { _id, properties }
})
