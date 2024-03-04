export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  const entityId = getObjectId(getRouterParam(event, 'entityId'))

  return await aggregateEntity(entu, entityId)
})
