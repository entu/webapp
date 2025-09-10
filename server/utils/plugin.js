export async function triggerWebhooks (entu, entityId, pluginType) {
  // Get all plugins of the specified type
  const plugins = await entu.db.collection('entity').find({
    'private._type.string': 'plugin',
    'private.type.string': pluginType
  }, {
    projection: { url: true }
  }).toArray()

  console.log('plugins:', plugins)

  if (!plugins?.length) return

  // Get the entity
  const entity = await entu.db.collection('entity').findOne({ _id: entityId })

  console.log('entity:', entity)

  if (!entity) return

  // Get the entity type (only with plugins)
  const entityType = await entu.db.collection('entity').findOne({
    _id: entity.private?._type?.reference,
    'private.plugin.reference': {
      $in: plugins.map((plugin) => plugin._id)
    }
  }, {
    projection: { _id: true, 'private.plugin': true }
  })

  console.log('entityType:', entityType)

  if (!entityType) return

  const webhooks = entityType.private.plugin.map((x) => {
    return plugins.find((p) => p._id.toString() === x.reference.toString())
  })

  console.log('webhooks:', webhooks)
}
