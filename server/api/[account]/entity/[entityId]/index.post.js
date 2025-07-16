import { setEntity } from '~~/server/utils/entity'

defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Update entity by adding or modifying properties',
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
          description: 'Entity ID to update'
        }
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'array',
            description: 'Array of property objects to add or update',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', description: 'Property type', example: 'name' },
                string: { type: 'string', description: 'String value', example: 'Updated Name' },
                number: { type: 'number', description: 'Number value', example: 100 },
                boolean: { type: 'boolean', description: 'Boolean value', example: false },
                reference: { type: 'string', description: 'Reference to another entity' },
                date: { type: 'string', format: 'date', description: 'Date value', example: '2025-01-28' },
                datetime: { type: 'string', format: 'date-time', description: 'DateTime value', example: '2025-01-28T08:21:25.637Z' },
                language: { type: 'string', description: 'Language code for multilingual properties', example: 'en' }
              },
              required: ['type']
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Updated entity with new/modified properties',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  description: 'Entity ID',
                  example: '6798938432faaba00f8fc72f'
                },
                properties: {
                  type: 'object',
                  description: 'Updated properties indexed by property name',
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
        description: 'Forbidden - Insufficient permissions to update entity',
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
  const body = await readBody(event)

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  const entityId = getObjectId(getRouterParam(event, 'entityId'))

  const { _id, properties } = await setEntity(entu, entityId, body)

  return { _id, properties }
})
