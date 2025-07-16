import { setEntity } from '~~/server/utils/entity'

defineRouteMeta({
  openAPI: {
    tags: ['Entity'],
    description: 'Update entity properties',
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
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            description: 'Entity properties to update'
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
