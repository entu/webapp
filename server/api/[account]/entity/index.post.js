defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Create new entity',
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
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', description: 'Property type' },
                string: { type: 'string', description: 'String value' },
                number: { type: 'number', description: 'Number value' },
                boolean: { type: 'boolean', description: 'Boolean value' },
                reference: { type: 'string', description: 'Reference to another entity' },
                date: { type: 'string', format: 'date', description: 'Date value' },
                datetime: { type: 'string', format: 'date-time', description: 'DateTime value' },
                language: { type: 'string', description: 'Language code' }
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Created entity',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _id: { type: 'string', description: 'Entity ID' },
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
      },
      403: {
        description: 'No user authenticated'
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
