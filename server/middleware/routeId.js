import { ObjectId } from 'mongodb'

export default defineEventHandler((event) => {
  const entityId = getRouterParam(event, 'entityId')
  const propertyId = getRouterParam(event, 'propertyId')

  if (entityId) {
    event.context.entu._id = new ObjectId(entityId)
  }

  if (propertyId) {
    event.context.entu._id = new ObjectId(propertyId)
  }
})
