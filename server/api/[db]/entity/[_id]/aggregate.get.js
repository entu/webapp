defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Force re-aggregation of entity properties (formulas, computed fields, inherited values) and return fresh entity data. Useful after external data changes or to refresh cached calculations. Returns same structure as GET entity',
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
        description: 'Entity aggregated data with computed fields',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Aggregated entity data with computed properties and relationships',
              properties: {
                _id: { type: 'string', description: 'Entity ID' },
                aggregatedProperties: {
                  type: 'object',
                  description: 'Computed and aggregated properties',
                  additionalProperties: true
                },
                relationships: {
                  type: 'object',
                  description: 'Related entities and their data',
                  additionalProperties: true
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

  const entityId = getObjectId(getRouterParam(event, '_id'))

  return await aggregateEntity(entu, entityId)
})
