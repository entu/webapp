import { createHash } from 'node:crypto'

// Recomputes and saves the aggregated entity with computed fields, rights, and search indexes
export async function aggregateEntity (entu, entityId) {
  const entity = await entu.db.collection('entity').findOne({ _id: entityId }, {
    projection: {
      aggregated: true,
      'private.name': true,
      'private._type': true,
      'private._noaccess': true,
      'private._viewer': true,
      'private._expander': true,
      'private._editor': true,
      'private._owner': true
    }
  })

  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: `Entity ${entityId} not found`
    })
  }

  const properties = await entu.db.collection('property').find({ entity: entityId, deleted: { $exists: false } }).toArray()

  // delete entity
  if (properties.some((x) => x.type === '_deleted')) {
    await entu.db.collection('entity').deleteOne({ _id: entityId })

    // console.log(`DELETED ${entu.account} ${entityId}`)

    return {
      account: entu.account,
      entity: entityId,
      deleted: true,
      message: 'Entity is deleted'
    }
  }

  const newEntity = await propertiesToEntity(entu, properties)

  if (newEntity.private._parent) {
    newEntity.domain._parent = newEntity.private._parent
    newEntity.public._parent = newEntity.private._parent
  }

  if (newEntity.private._sharing) {
    newEntity.domain._sharing = newEntity.private._sharing
    newEntity.public._sharing = newEntity.private._sharing
  }

  // get info from type
  if (newEntity.private._type) {
    newEntity.domain._type = newEntity.private._type
    newEntity.public._type = newEntity.private._type

    if (newEntity.private._type.at(0)?.reference) {
      // get entity definition's _sharing
      const definitionEntity = await entu.db.collection('entity').findOne({
        _id: newEntity.private._type.at(0).reference
      }, {
        projection: { 'private._sharing': true }
      })

      const definitionSharing = definitionEntity?.private?._sharing?.at(0)?.string

      const definition = await entu.db.collection('entity').aggregate([
        {
          $match: {
            'private._parent.reference': newEntity.private._type.at(0).reference,
            'private._type.string': 'property',
            'private.name.string': { $exists: true }
          }
        }, {
          $project: {
            _id: false,
            name: { $arrayElemAt: ['$private.name.string', 0] },
            sharing: { $arrayElemAt: ['$private._sharing.string', 0] },
            search: { $arrayElemAt: ['$private.search.boolean', 0] },
            formula: { $arrayElemAt: ['$private.formula.string', 0] }
          }
        }
      ]).toArray()

      for (let d = 0; d < definition.length; d++) {
        let sharing = definition[d].sharing

        if (!definitionSharing) {
          sharing = undefined
        }
        else if (definitionSharing === 'domain' && definition[d].sharing === 'public') {
          sharing = 'domain'
        }
        // console.log(definition[d].name, definitionSharing, definition[d].sharing, sharing)

        if (definition[d].formula) {
          const formulaValue = await formula(entu, definition[d].formula, entityId)

          if (formulaValue) {
            newEntity.private[definition[d].name] = [formulaValue]
          }
        }

        const dValue = newEntity.private[definition[d].name]

        if (definition[d].search && dValue) {
          newEntity.search.private = [
            ...(newEntity.search.private || []),
            ...await getValueArray(entu, dValue)
          ]

          if (sharing === 'domain') {
            newEntity.search.domain = [
              ...(newEntity.search.domain || []),
              ...await getValueArray(entu, dValue)
            ]
          }

          if (sharing === 'public') {
            newEntity.search.public = [
              ...(newEntity.search.public || []),
              ...await getValueArray(entu, dValue)
            ]
          }
        }

        if (sharing === 'domain' && dValue) {
          newEntity.domain[definition[d].name] = dValue
        }

        if (sharing === 'public' && dValue) {
          newEntity.domain[definition[d].name] = dValue
          newEntity.public[definition[d].name] = dValue
        }
      }
    }
    else {
      loggerError(`No type reference`, entu, [`entity:${entityId}`])
    }
  }
  else {
    loggerError(`No type ${newEntity.private._type}`, entu, [`entity:${entityId}`])
  }

  // get and set parent rights
  let parentRights = {}
  if (newEntity.private._parent?.length > 0 && newEntity.private._inheritrights?.at(0)?.boolean === true) {
    parentRights = await getParentRights(entu, newEntity.private._parent)

    if (parentRights._viewer) {
      newEntity.private._parent_viewer = uniqBy(parentRights._viewer, (x) => x.reference.toString())
    }
    if (parentRights._expander) {
      newEntity.private._parent_expander = uniqBy(parentRights._expander, (x) => x.reference.toString())
    }
    if (parentRights._editor) {
      newEntity.private._parent_editor = uniqBy(parentRights._editor, (x) => x.reference.toString())
    }
    if (parentRights._owner) {
      newEntity.private._parent_owner = uniqBy(parentRights._owner, (x) => x.reference.toString())
    }
  }

  // combine rights
  const noRights = newEntity.private._noaccess?.map((x) => x.reference.toString())

  newEntity.private._owner = uniqBy([
    ...(parentRights._owner || []),
    ...(newEntity.private._owner || [])
  ], (x) => [x.reference.toString(), x.inherited || false].join('-')).filter((x) => !noRights?.includes(x.reference.toString()))

  newEntity.private._editor = uniqBy([
    ...(parentRights._editor || []),
    ...(newEntity.private._editor || []),
    ...(newEntity.private._owner || [])
  ], (x) => [x.reference.toString(), x.inherited || false].join('-')).filter((x) => !noRights?.includes(x.reference.toString()))

  newEntity.private._expander = uniqBy([
    ...(parentRights._expander || []),
    ...(newEntity.private._expander || []),
    ...(newEntity.private._editor || [])
  ], (x) => [x.reference.toString(), x.inherited || false].join('-')).filter((x) => !noRights?.includes(x.reference.toString()))

  newEntity.private._viewer = uniqBy([
    ...(parentRights._viewer || []),
    ...(newEntity.private._viewer || []),
    ...(newEntity.private._expander || [])
  ], (x) => [x.reference.toString(), x.inherited || false].join('-')).filter((x) => !noRights?.includes(x.reference.toString()))

  const { _noaccess, _viewer, _expander, _editor, _owner } = combineRights({
    _noaccess: newEntity.private._noaccess,
    _viewer: newEntity.private._viewer,
    _expander: newEntity.private._expander,
    _editor: newEntity.private._editor,
    _owner: newEntity.private._owner
  })

  newEntity.access = getAccessArray(newEntity)

  if (!newEntity.access?.length) {
    delete newEntity.access
  }

  if (!_noaccess?.length) {
    delete newEntity.private._noaccess
  }
  else {
    newEntity.private._noaccess = _noaccess
  }
  if (!_viewer?.length) {
    delete newEntity.private._viewer
  }
  else {
    newEntity.private._viewer = _viewer
  }
  if (!_expander?.length) {
    delete newEntity.private._expander
  }
  else {
    newEntity.private._expander = _expander
  }
  if (!_editor?.length) {
    delete newEntity.private._editor
  }
  else {
    newEntity.private._editor = _editor
  }
  if (!_owner?.length) {
    delete newEntity.private._owner
  }
  else {
    newEntity.private._owner = _owner
  }

  if (!newEntity.private._parent_viewer?.length) {
    delete newEntity.private._parent_viewer
  }
  if (!newEntity.private._parent_expander?.length) {
    delete newEntity.private._parent_expander
  }
  if (!newEntity.private._parent_editor?.length) {
    delete newEntity.private._parent_editor
  }
  if (!newEntity.private._parent_owner?.length) {
    delete newEntity.private._parent_owner
  }

  if (newEntity.private?._sharing?.at(0)?.string !== 'domain' || Object.keys(newEntity.domain).length === 0) {
    delete newEntity.domain
  }

  if (newEntity.private?._sharing?.at(0)?.string !== 'public' || Object.keys(newEntity.public).length === 0) {
    delete newEntity.public
  }

  if (newEntity.search?.private?.length > 0) {
    newEntity.search.private = makeSearchArray(newEntity.search.private)
  }

  if (newEntity.search?.domain?.length > 0 || newEntity.search?.public?.length > 0) {
    newEntity.search.domain = makeSearchArray([...newEntity.search.domain || [], ...newEntity.search.public || []])
  }

  if (newEntity.search?.public?.length > 0) {
    newEntity.search.public = makeSearchArray(newEntity.search.public)
  }

  if (!newEntity.search?.private && !newEntity.search?.domain && !newEntity.search?.public) {
    delete newEntity.search
  }

  newEntity.hash = getEntityHash(newEntity.private)

  await entu.db.collection('entity').replaceOne({ _id: entityId }, newEntity, { upsert: true })

  const sqsLength = await startRelativeAggregation(entu, entity, newEntity)

  if (sqsLength > 0) {
    logger(`Added ${sqsLength} entities to aggregation`, entu, [`entity:${entityId}`])
  }

  return {
    account: entu.account,
    entity: entityId,
    queued: sqsLength,
    message: 'Entity is aggregated'
  }
}

// Converts a flat properties array into a structured entity object
async function propertiesToEntity (entu, properties) {
  const entity = {
    aggregated: new Date(),
    private: {},
    domain: {},
    public: {},
    access: [],
    search: {}
  }

  for (let n = 0; n < properties.length; n++) {
    const prop = properties[n]
    let cleanProp = { ...prop }
    delete cleanProp.entity
    delete cleanProp.type
    delete cleanProp.created
    delete cleanProp.search
    delete cleanProp.public

    if (!entity.private[prop.type]) {
      entity.private[prop.type] = []
    }

    if (prop.reference) {
      const referenceEntity = await entu.db.collection('entity').findOne({ _id: prop.reference }, { projection: { _id: false, 'private.name': true, 'private._type': true } })

      if (referenceEntity) {
        cleanProp = { ...cleanProp, property_type: prop.type, string: referenceEntity.private?.name?.at(0).string, entity_type: referenceEntity.private?._type?.at(0).string }
      }

      if (!prop.type.startsWith('_')) {
        if (entity.private._reference) {
          entity.private._reference = [...entity.private._reference, cleanProp]
        }
        else {
          entity.private._reference = [cleanProp]
        }
      }
    }

    entity.private[prop.type] = [...entity.private[prop.type], cleanProp]
  }

  return entity
}

// Generates all unique substrings of value strings for full-text search indexing
function makeSearchArray (array) {
  if (!array || array.length === 0) return []

  const result = []

  for (const str of array) {
    const words = `${str}`.toLowerCase().split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean)

    for (const word of words) {
      // Generate all substrings up to 20 characters long
      for (let startIndex = 0; startIndex < word.length; startIndex++) {
        const maxEndIndex = Math.min(word.length, startIndex + 20)

        for (let endIndex = startIndex + 1; endIndex <= maxEndIndex; endIndex++) {
          const substring = word.slice(startIndex, endIndex)
          result.push(substring)
        }
      }
    }
  }

  return [...new Set(result)].sort()
}

// Computes an MD5 hash of entity private properties to detect changes
function getEntityHash (obj) {
  const ids = []

  for (const [key, arr] of Object.entries(obj)) {
    for (const item of arr) {
      if (item._id) {
        ids.push(item._id.toString())
      }
      else if (item.string) {
        const hash = createHash('md5').update(`${key}: ${item.string}`).digest('hex')
        ids.push(hash)
      }
      else {
        const hash = createHash('md5').update(JSON.stringify(item)).digest('hex')
        ids.push(hash)
      }
    }
  }

  const joined = ids.sort().join(',')

  return createHash('md5').update(joined).digest('hex')
}

// Queues related entities for re-aggregation when name or rights change
async function startRelativeAggregation (entu, oldEntity, newEntity) {
  let ids = []

  // Check if entity has changed
  if (Boolean(oldEntity.hash) && oldEntity.hash === newEntity.hash) return 0

  // Check if name has changed
  const oldName = oldEntity.private?.name?.map((x) => x.string || '') || []
  const newName = newEntity.private?.name?.map((x) => x.string || '') || []
  oldName.sort()
  newName.sort()

  if (oldName.join('|') !== newName.join('|')) {
    const referrers = await entu.db.collection('property').aggregate([
      { $match: { reference: oldEntity._id, deleted: { $exists: false } } },
      { $group: { _id: '$entity' } }
    ]).toArray()

    // logger(`Aggregation - Name changed`, entu, [`entity:${oldEntity._id}`])

    ids = referrers.map((x) => x._id)
  }

  // Check if rights have changed
  const rightProperties = ['_noaccess', '_viewer', '_expander', '_editor', '_owner']
  const oldRights = rightProperties.map((type) => oldEntity.private?.[type]?.map((x) => `${type}:${x.reference}`) || []).flat()
  const newRights = rightProperties.map((type) => newEntity.private?.[type]?.map((x) => `${type}:${x.reference}`) || []).flat()
  oldRights.sort()
  newRights.sort()

  if (oldRights.join('|') !== newRights.join('|')) {
    const childs = await entu.db.collection('entity').find({
      'private._parent.reference': oldEntity._id,
      'private._inheritrights.boolean': true
    }, {
      projection: { _id: true }
    }).toArray()

    // logger(`Aggregation - Rights changed`, entu, [`entity:${oldEntity._id}`])

    ids = [...ids, ...childs.map((x) => x._id)]
  }

  // Check formulas
  // if (oldEntity.hash !== newEntity.hash) {
  //   const formulaChilds = await entu.db.collection('entity').find({
  //     'private._parent.reference': oldEntity._id
  //   }, {
  //     projection: { _id: true }
  //   }).toArray()
  //   const formulaChildsIds = formulaChilds.map((x) => x._id)
  //   const formulaOldParentIds = oldEntity.private?._parent?.map((x) => x.reference) || []
  //   const formulaNewParentIds = newEntity.private?._parent?.map((x) => x.reference) || []

  //   const formulaEntities = await entu.db.collection('entity').find({
  //     _id: { $in: [...formulaChildsIds, ...formulaOldParentIds, ...formulaNewParentIds] },
  //     'private._type.reference': { $exists: true }
  //   }, {
  //     projection: { 'private._type.reference': true }
  //   }).toArray()

  //   const formulaEntityIds = await Promise.all(formulaEntities.map(async (x) => {
  //     return await Promise.all(x.private?._type?.map(async (y) => {
  //       const formulaProperties = await entu.db.collection('entity').countDocuments({
  //         'private._parent.reference': y.reference,
  //         'private.formula.string': { $exists: true }
  //       })

  //       if (formulaProperties === 0) return

  //       return x._id
  //     }))
  //   }))

  //   ids = [...ids, ...formulaEntityIds.flat().filter(Boolean)]
  // }

  ids = uniqBy(ids, (x) => x.toString())

  if (ids.length === 0) return 0

  await addAggregateQueue(entu, ids)

  return ids.length
}

// Marks entities as queued for background aggregation
export async function addAggregateQueue (entu, entityIds) {
  await entu.db.collection('entity').updateMany({
    _id: { $in: entityIds }
  }, {
    $set: {
      queued: new Date()
    }
  })
}
