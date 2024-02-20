export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  const entityId = getObjectId(getRouterParam(event, 'entityId'))
  const entity = await entu.db.collection('entity').findOne({
    _id: entityId
  }, {
    projection: {
      _id: false,
      access: true
    }
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Entity not found'
    })
  }

  const access = entity.access?.map(s => s.toString()) || []

  if (!access.includes(entu.userStr)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User not in any rights property'
    })
  }

  const changes = await entu.db.collection('property').aggregate([
    {
      $match: {
        entity: entityId,
        type: { $nin: ['_mid', '_created'] }
      }
    }, {
      $project: {
        type: '$type',
        at: '$created.at',
        by: '$created.by',
        new: {
          boolean: '$boolean',
          date: '$date',
          datetime: '$datetime',
          filename: '$filename',
          filesize: '$filesize',
          md5: '$md5',
          number: '$number',
          reference: '$reference',
          string: '$string'
        }
      }
    }, {
      $unionWith: {
        coll: 'property',
        pipeline: [
          {
            $match: {
              entity: entityId,
              deleted: { $exists: true },
              type: {
                $nin: ['_mid', '_created']
              }
            }
          }, {
            $project: {
              type: '$type',
              at: '$deleted.at',
              by: '$deleted.by',
              old: {
                boolean: '$boolean',
                date: '$date',
                datetime: '$datetime',
                filename: '$filename',
                filesize: '$filesize',
                md5: '$md5',
                number: '$number',
                reference: '$reference',
                string: '$string'
              }
            }
          }
        ]
      }
    }, {
      $group: {
        _id: { type: '$type', at: '$at', by: '$by' },
        type: { $max: '$type' },
        at: { $max: '$at' },
        by: { $max: '$by' },
        old: { $max: '$old' },
        new: { $max: '$new' }
      }
    }, {
      $project: { _id: false }
    }, {
      $sort: { at: 1 }
    }
  ]).toArray()

  const cleanChanges = changes.map((x) => {
    if (x.type === 'entu_api_key') {
      if (x.old.string) x.old.string = '***'
      if (x.new.string) x.new.string = '***'
    }

    if (x.at === null) delete x.at
    if (x.by === null) delete x.by
    if (x.old === null) delete x.old
    if (x.new === null) delete x.new

    return x
  })

  return cleanChanges
})
