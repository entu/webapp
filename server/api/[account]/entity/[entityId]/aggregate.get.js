defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Get entity aggregated data',
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
      }
    ]
  }
})

export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  const entityId = getObjectId(getRouterParam(event, 'entityId'))

  return await aggregateEntity(entu, entityId)
})
