import { setEntity } from '~/server/utils/entity'

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
