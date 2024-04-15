// Return public or private properties (based user rights)
export async function claenupEntity (entu, entity, _thumbnail) {
  if (!entity) return

  let result = { _id: entity._id }

  if (entu.userStr && entity.access?.map(x => x.toString())?.includes(entu.userStr)) {
    result = { ...result, ...entity.private }
  } else if (entu.userStr && entity.access?.includes('domain')) {
    result = { ...result, ...entity.private }
  } else if (entity.access?.includes('public')) {
    result = { ...result, ...entity.public }
  } else {
    return
  }

  if (_thumbnail && result.photo?.at(0)) {
    result._thumbnail = await getSignedDownloadUrl(entu.account, result._id, result.photo.at(0))
  }

  if (result.entu_api_key) {
    result.entu_api_key.forEach((k) => {
      k.string = '***'
    })
  }

  if (!result._thumbnail) {
    delete result._thumbnail
  }

  return result
}

export async function setEntity (entu, entityId, properties) {
  const allowedTypes = [
    '_type',
    '_parent',
    '_noaccess',
    '_viewer',
    '_expander',
    '_editor',
    '_owner',
    '_sharing',
    '_inheritrights'
  ]

  const rightTypes = [
    '_noaccess',
    '_viewer',
    '_expander',
    '_editor',
    '_owner',
    '_sharing',
    '_inheritrights'
  ]

  const createdDt = new Date()

  if (!properties) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No data'
    })
  }
  if (!Array.isArray(properties)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data must be array'
    })
  }
  if (properties.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one property must be set'
    })
  }

  if (entityId) {
    const entity = await entu.db.collection('entity').findOne({
      _id: entityId
    }, {
      projection: {
        _id: false,
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

    const access = entity.private?._editor?.map(s => s.reference?.toString()) || []

    if (!access.includes(entu.userStr) && !entu.systemUser) {
      throw createError({
        statusCode: 403,
        statusMessage: 'User not in _owner nor _editor property'
      })
    }

    const rigtsProperties = properties.filter(property => rightTypes.includes(property.type))
    const owners = entity.private?._owner?.map(s => s.reference?.toString()) || []

    if (rigtsProperties.length > 0 && !owners.includes(entu.userStr) && !entu.systemUser) {
      throw createError({
        statusCode: 403,
        statusMessage: 'User not in _owner property'
      })
    }
  }

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]

    if (!property.type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Property type not set'
      })
    }
    if (!property.type.match(/^[A-Za-z0-9_]+$/)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Property type must be alphanumeric'
      })
    }
    if (property.type.startsWith('_') && !allowedTypes.includes(property.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Property type can\'t begin with _'
      })
    }

    if (property.type === '_parent' && property.reference) {
      const parent = await entu.db.collection('entity').findOne({
        _id: getObjectId(property.reference)
      }, {
        projection: {
          _id: false,
          'private._expander': true,
          'private._sharing': true,
          'private._inheritrights': true
        }
      })

      if (!parent) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Entity in _parent property not found'
        })
      }

      const parentAccess = parent.private?._expander?.map(s => s.reference?.toString()) || []

      if (!parentAccess.includes(entu.userStr) && !entu.systemUser) {
        throw createError({
          statusCode: 400,
          statusMessage: 'User not in parent _owner, _editor nor _expander property'
        })
      }

      if (parent.private?._sharing?.at(0).string && !properties.some(x => x.type === '_sharing')) {
        properties.push({
          entity: entityId,
          type: '_sharing',
          string: parent.private?._sharing.at(0).string.toLowerCase(),
          created: { at: createdDt, by: entu.user || 'entu' }
        })
      }

      if (parent.private?._inheritrights?.at(0)?.boolean === true && !properties.some(x => x.type === '_inheritrights')) {
        properties.push({
          entity: entityId,
          type: '_inheritrights',
          boolean: true,
          created: { at: createdDt, by: entu.user || 'entu' }
        })
      }
    }
  }

  if (!entityId) {
    const entityType = properties.find(x => x.type === '_type' && x.reference)

    if (entityType) {
      const defaultParents = await entu.db.collection('entity').findOne({ _id: getObjectId(entityType.reference), 'private.default_parent': { $exists: true } }, { projection: { 'private.default_parent': true } })

      if (defaultParents) {
        defaultParents.private.default_parent.forEach((parent) => {
          properties.push({ entity: entityId, type: '_parent', reference: parent.reference, created: { at: createdDt, by: entu.user || 'entu' } })
        })
      }
    }

    const entity = await entu.db.collection('entity').insertOne({})
    entityId = entity.insertedId

    if (entu.user) {
      properties.push({ entity: entityId, type: '_owner', reference: entu.user, created: { at: createdDt, by: entu.user } })
      properties.push({ entity: entityId, type: '_created', reference: entu.user, datetime: createdDt, created: { at: createdDt, by: entu.user } })
    } else {
      properties.push({ entity: entityId, type: '_created', datetime: createdDt, created: { at: createdDt, by: 'entu' } })
    }
  }

  const pIds = []
  const oldPIds = []
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]

    if (property._id) {
      oldPIds.push(getObjectId(property._id))

      delete property._id
    }
    if (property.reference) { property.reference = getObjectId(property.reference) }
    if (property.date) { property.date = new Date(property.date) }
    if (property.datetime) { property.datetime = new Date(property.datetime) }

    property.entity = entityId
    property.created = {
      at: createdDt,
      by: entu.user || 'entu'
    }

    const insertedProperty = await entu.db.collection('property').insertOne(property)
    const newProperty = { _id: insertedProperty.insertedId, ...property }

    delete newProperty.entity
    delete newProperty.created

    if (property.filename && property.filesize && property.filetype) {
      const contentDisposition = `inline;filename="${encodeURI(property.filename.replace('"', '\"'))}"`

      newProperty.upload = {
        url: await getSignedUploadUrl(entu.account, entityId, newProperty, contentDisposition, property.filetype),
        method: 'PUT',
        headers: {
          ACL: 'private',
          'Content-Disposition': contentDisposition,
          'Content-Type': property.filetype
        }
      }
    }

    pIds.push(newProperty)
  }

  if (oldPIds.length > 0) {
    await entu.db.collection('property').updateMany({
      _id: { $in: oldPIds },
      deleted: { $exists: false }
    }, {
      $set: {
        deleted: {
          at: new Date(),
          by: entu.user || 'entu'
        }
      }
    })
  }

  await aggregateEntity(entu, entityId)

  return { _id: entityId, properties: pIds }
}

export async function addAggregateQueue (entu, entityId) {
  await entu.db.collection('entity').updateOne({
    _id: entityId,
    queued: { $exists: false }
  }, {
    $set: {
      queued: new Date()
    }
  })
}

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
  if (properties.some(x => x.type === '_deleted')) {
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

  if (newEntity.private._sharing) {
    newEntity.public._sharing = newEntity.private._sharing
  }

  // get info from type
  if (newEntity.private._type) {
    newEntity.public._type = newEntity.private._type

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
          public: { $arrayElemAt: ['$private.public.boolean', 0] },
          search: { $arrayElemAt: ['$private.search.boolean', 0] },
          formula: { $arrayElemAt: ['$private.formula.string', 0] }
        }
      }
    ]).toArray()

    for (let d = 0; d < definition.length; d++) {
      if (definition[d].formula) {
        newEntity.private[definition[d].name] = [await formula(entu, definition[d].formula, entityId)]
      }

      const dValue = newEntity.private[definition[d].name]

      if (definition[d].search && dValue) {
        newEntity.search.private = [
          ...(newEntity.search.private || []),
          ...getValueArray(dValue)
        ]

        if (definition[d].public) {
          newEntity.search.public = [
            ...(newEntity.search.public || []),
            ...getValueArray(dValue)
          ]
        }
      }

      if (definition[d].public && dValue) {
        newEntity.public[definition[d].name] = dValue
      }
    }
  } else {
    console.log(`NO_TYPE ${entu.account} ${newEntity.private._type} ${entityId}`)
  }

  // get and set parent rights
  let parentRights = {}
  if (newEntity.private._parent?.length > 0 && newEntity.private._inheritrights?.at(0)?.boolean === true) {
    parentRights = await getParentRights(entu, newEntity.private._parent)

    if (parentRights._viewer) { newEntity.private._parent_viewer = uniqBy(parentRights._viewer, x => x.reference.toString()) }
    if (parentRights._expander) { newEntity.private._parent_expander = uniqBy(parentRights._expander, x => x.reference.toString()) }
    if (parentRights._editor) { newEntity.private._parent_editor = uniqBy(parentRights._editor, x => x.reference.toString()) }
    if (parentRights._owner) { newEntity.private._parent_owner = uniqBy(parentRights._owner, x => x.reference.toString()) }
  }

  // combine rights
  const noRights = newEntity.private._noaccess?.map(x => x.reference.toString())

  newEntity.private._owner = uniqBy([
    ...(parentRights._owner || []),
    ...(newEntity.private._owner || [])
  ], x => [x.reference.toString(), x.inherited || false].join('-')).filter(x => !noRights?.includes(x.reference.toString()))

  newEntity.private._editor = uniqBy([
    ...(parentRights._editor || []),
    ...(newEntity.private._editor || []),
    ...(newEntity.private._owner || [])
  ], x => [x.reference.toString(), x.inherited || false].join('-')).filter(x => !noRights?.includes(x.reference.toString()))

  newEntity.private._expander = uniqBy([
    ...(parentRights._expander || []),
    ...(newEntity.private._expander || []),
    ...(newEntity.private._editor || [])
  ], x => [x.reference.toString(), x.inherited || false].join('-')).filter(x => !noRights?.includes(x.reference.toString()))

  newEntity.private._viewer = uniqBy([
    ...(parentRights._viewer || []),
    ...(newEntity.private._viewer || []),
    ...(newEntity.private._expander || [])
  ], x => [x.reference.toString(), x.inherited || false].join('-')).filter(x => !noRights?.includes(x.reference.toString()))

  const { _noaccess, _viewer, _expander, _editor, _owner } = combineRights({
    _noaccess: newEntity.private._noaccess,
    _viewer: newEntity.private._viewer,
    _expander: newEntity.private._expander,
    _editor: newEntity.private._editor,
    _owner: newEntity.private._owner
  })

  if (_noaccess) { newEntity.private._noaccess = _noaccess }
  if (_viewer) { newEntity.private._viewer = _viewer }
  if (_expander) { newEntity.private._expander = _expander }
  if (_editor) { newEntity.private._editor = _editor }
  if (_owner) { newEntity.private._owner = _owner }

  newEntity.access = getAccessArray(newEntity)

  if (!['domain', 'public'].includes(newEntity.private?._sharing?.at(0)?.string) || Object.keys(newEntity.public).length === 0) {
    delete newEntity.public
  }

  if (newEntity.search?.private?.length > 0) {
    newEntity.search.private = makeSearchArray(newEntity.search.private)
  }

  if (newEntity.search?.public?.length > 0) {
    newEntity.search.public = makeSearchArray(newEntity.search.public)
  }

  if (!newEntity.search?.private && !newEntity.search?.public) {
    delete newEntity.search
  }

  await entu.db.collection('entity').replaceOne({ _id: entityId }, newEntity, { upsert: true })

  const sqsLength = await startRelativeAggregation(entu, entity, newEntity)

  // if (sqsLength > 0) {
  //   console.log(`UPDATED_SQS ${entu.account} ${entityId}`)
  // }

  return {
    account: entu.account,
    entity: entityId,
    queued: sqsLength,
    message: 'Entity is aggregated'
  }
}

async function propertiesToEntity (entu, properties) {
  const entity = {
    aggregated: new Date(),
    private: {},
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
      } else {
        cleanProp = { ...cleanProp, property_type: prop.type, string: prop.reference.toString() }
        console.log(`NO_REFERENCE ${entu.account} ${prop.reference.toString()}`)
      }

      if (!prop.type.startsWith('_')) {
        if (entity.private._reference) {
          entity.private._reference = [...entity.private._reference, cleanProp]
        } else {
          entity.private._reference = [cleanProp]
        }
      }
    }

    delete cleanProp.property_type
    delete cleanProp.entity_type

    entity.private[prop.type] = [...entity.private[prop.type], cleanProp]
  }

  return entity
}

async function formula (entu, str, entityId) {
  const strArray = str.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)

  const func = formulaFunction(strArray)
  const data = formulaContent(strArray, func)

  let valueArray = []

  for (let i = 0; i < data.length; i++) {
    const value = await formulaField(entu, data[i], entityId)

    if (value) {
      valueArray = [...valueArray, ...value]
    }
  }

  valueArray = getValueArray(valueArray)

  switch (func) {
    case 'CONCAT':
      return { string: valueArray.join('') }
    case 'COUNT':
      return { number: valueArray.length }
    case 'SUM':
      return { number: valueArray.reduce((a, b) => a + b, 0) }
    case 'SUBTRACT':
      return { number: valueArray.reduce((a, b) => a - b, 0) + (valueArray.at(0) * 2) }
    case 'AVERAGE':
      return { number: valueArray.reduce((a, b) => a + b, 0) / valueArray.length }
    case 'MIN':
      return { number: Math.min(...valueArray) }
    case 'MAX':
      return { number: Math.max(...valueArray) }
    default:
      return { string: valueArray.join('') }
  }
}

async function formulaField (entu, str, entityId) {
  str = str.trim()

  if ((str.startsWith("'") || str.startsWith('"')) && (str.endsWith("'") || str.endsWith('"'))) {
    return [{
      string: str.substring(1, str.length - 1)
    }]
  }

  if (parseFloat(str).toString() === str) {
    return [{
      number: parseFloat(str)
    }]
  }

  const strParts = str.split('.')

  const [fieldRef, fieldType, fieldProperty] = str.split('.')

  let result

  // same entity _id
  if (strParts.length === 1 && str === '_id') {
    result = [{ _id: entityId }]

  // same entity property
  } else if (strParts.length === 1 && str !== '_id') {
    result = await entu.db.collection('property').find({
      entity: entityId,
      type: str,
      string: { $exists: true },
      deleted: { $exists: false }
    }, {
      sort: { _id: 1 },
      projection: { _id: false, entity: false, type: false }
    }).toArray()

  // childs _id
  } else if (strParts.length === 3 && fieldRef === '_child' && fieldType === '*' && fieldProperty === '_id') {
    result = await entu.db.collection('entity').find({
      'private._parent.reference': entityId
    }, {
      projection: { _id: true }
    }).toArray()

  // childs (with type) property
  } else if (strParts.length === 3 && fieldRef === '_child' && fieldType !== '*' && fieldProperty === '_id') {
    result = await entu.db.collection('entity').find({
      'private._parent.reference': entityId,
      'private._type.string': fieldType
    }, {
      projection: { _id: true }
    }).toArray()

  // childs property
  } else if (strParts.length === 3 && fieldRef === '_child' && fieldType === '*' && fieldProperty !== '_id') {
    result = await entu.db.collection('entity').aggregate([
      {
        $match: { 'private._parent.reference': entityId }
      }, {
        $lookup: {
          from: 'property',
          let: { entityId: '$_id' },
          pipeline: [
            {
              $match: {
                type: fieldProperty,
                deleted: { $exists: false },
                $expr: { $eq: ['$entity', '$$entityId'] }
              }
            }, {
              $project: { _id: false, entity: false, type: false, created: false }
            }
          ],
          as: 'properties'
        }
      }, {
        $project: { properties: true }
      }, {
        $unwind: '$properties'
      }, {
        $replaceWith: '$properties'
      }
    ]).toArray()

  // childs (with type) property
  } else if (strParts.length === 3 && fieldRef === '_child' && fieldType !== '*' && fieldProperty !== '_id') {
    result = await entu.db.collection('entity').aggregate([
      {
        $match: {
          'private._parent.reference': entityId,
          'private._type.string': fieldType
        }
      }, {
        $lookup: {
          from: 'property',
          let: { entityId: '$_id' },
          pipeline: [
            {
              $match: {
                type: fieldProperty,
                deleted: { $exists: false },
                $expr: { $eq: ['$entity', '$$entityId'] }
              }
            }, {
              $project: { _id: false, entity: false, type: false, created: false }
            }
          ],
          as: 'properties'
        }
      }, {
        $project: { properties: true }
      }, {
        $unwind: '$properties'
      }, {
        $replaceWith: '$properties'
      }
    ]).toArray()

  // parents _id
  } else if (strParts.length === 3 && fieldRef === '_parent' && fieldType === '*' && fieldProperty === '_id') {
    result = await entu.db.collection('property').aggregate([
      {
        $match: {
          entity: entityId,
          type: '_parent',
          reference: { $exists: true },
          deleted: { $exists: false }
        }
      }, {
        $project: { _id: '$reference' }
      }
    ]).toArray()

  // parents (with type) _id
  } else if (strParts.length === 3 && fieldRef === '_parent' && fieldType !== '*' && fieldProperty === '_id') {
    result = await entu.db.collection('property').aggregate([
      {
        $match: {
          entity: entityId,
          type: '_parent',
          reference: { $exists: true },
          deleted: { $exists: false }
        }
      }, {
        $lookup: {
          from: 'entity',
          let: { entityId: '$reference' },
          pipeline: [
            {
              $match: {
                'private._type.string': fieldType,
                $expr: { $eq: ['$_id', '$$entityId'] }
              }
            }, {
              $project: { _id: true }
            }
          ],
          as: 'parents'
        }
      }, {
        $unwind: '$parents'
      }, {
        $replaceWith: '$parents'
      }
    ]).toArray()

  // parents property
  } else if (strParts.length === 3 && fieldRef === '_parent' && fieldType === '*' && fieldProperty !== '_id') {
    result = await entu.db.collection('property').aggregate([
      {
        $match: {
          entity: entityId,
          type: '_parent',
          reference: { $exists: true },
          deleted: { $exists: false }
        }
      }, {
        $lookup: {
          from: 'property',
          let: { entityId: '$reference' },
          pipeline: [
            {
              $match: {
                type: fieldProperty,
                deleted: { $exists: false },
                $expr: { $eq: ['$entity', '$$entityId'] }
              }
            }, {
              $project: { _id: false, entity: false, type: false, created: false }
            }
          ],
          as: 'properties'
        }
      }, {
        $project: { properties: true }
      }, {
        $unwind: '$properties'
      }, {
        $replaceWith: '$properties'
      }
    ]).toArray()

  // parents (with type) property
  } else if (strParts.length === 3 && fieldRef === '_parent' && fieldType !== '*' && fieldProperty !== '_id') {
    result = await entu.db.collection('property').aggregate([
      {
        $match: {
          entity: entityId,
          type: '_parent',
          reference: { $exists: true },
          deleted: { $exists: false }
        }
      }, {
        $lookup: {
          from: 'entity',
          let: { entityId: '$reference' },
          pipeline: [
            {
              $match: {
                'private._type.string': fieldType,
                $expr: { $eq: ['$_id', '$$entityId'] }
              }
            }, {
              $project: { _id: true }
            }
          ],
          as: 'parents'
        }
      }, {
        $lookup: {
          from: 'property',
          let: { entityId: '$parents._id' },
          pipeline: [
            {
              $match: {
                type: fieldProperty,
                deleted: { $exists: false },
                $expr: { $in: ['$entity', '$$entityId'] }
              }
            }, {
              $project: { _id: false, entity: false, type: false, created: false }
            }
          ],
          as: 'properties'
        }
      }, {
        $project: { properties: true }
      }, {
        $unwind: '$properties'
      }, {
        $replaceWith: '$properties'
      }
    ]).toArray()
  }

  return result
}

function formulaFunction (data) {
  const func = data.at(-1)

  if (['CONCAT', 'COUNT', 'SUM', 'SUBTRACT', 'AVERAGE', 'MIN', 'MAX'].includes(func)) {
    return func
  } else {
    return 'CONCAT'
  }
}

function formulaContent (data, func) {
  if (data.at(-1) === func) {
    return data.slice(0, -1)
  } else {
    return data
  }
}

function getValueArray (values) {
  if (!values) return []

  return values.map(x => x.number || x.datetime || x.date || x.string || x._id)
}

async function getParentRights (entu, parents) {
  const parentRights = await entu.db.collection('entity').find({
    _id: { $in: parents.map(x => x.reference) }
  }, {
    projection: {
      _id: false,
      'private._noaccess': true,
      'private._viewer': true,
      'private._expander': true,
      'private._editor': true,
      'private._owner': true
    }
  }).toArray()

  const rights = combineRights(parentRights.reduce((acc, cur) => ({
    _viewer: [...acc._viewer, ...cur.private?._viewer],
    _expander: [...acc._expander, ...cur.private?._expander],
    _editor: [...acc._editor, ...cur.private?._editor],
    _owner: [...acc._owner, ...cur.private?._owner]
  }), {
    _viewer: [],
    _expander: [],
    _editor: [],
    _owner: []
  }))

  rights._noaccess = rights._noaccess?.map(x => ({ ...x, inherited: true }))
  rights._viewer = rights._viewer?.map(x => ({ ...x, inherited: true }))
  rights._expander = rights._expander?.map(x => ({ ...x, inherited: true }))
  rights._editor = rights._editor?.map(x => ({ ...x, inherited: true }))
  rights._owner = rights._owner?.map(x => ({ ...x, inherited: true }))

  return rights
}

function combineRights (rights) {
  const directNoaccess = rights._noaccess?.filter(x => x.inherited === undefined)?.map(x => x.reference.toString()) || []
  const directViewers = rights._viewer?.filter(x => x.inherited === undefined)?.map(x => x.reference.toString()) || []
  const directExpanders = rights._expander?.filter(x => x.inherited === undefined)?.map(x => x.reference.toString()) || []
  const directEditors = rights._editor?.filter(x => x.inherited === undefined)?.map(x => x.reference.toString()) || []
  const directOwners = rights._owner?.filter(x => x.inherited === undefined)?.map(x => x.reference.toString()) || []

  rights._noaccess = rights._noaccess?.filter(x => x.inherited === undefined || (x.inherited === true && !directNoaccess.includes(x.reference.toString())))
  rights._viewer = rights._viewer?.filter(x => x.inherited === undefined || (x.inherited === true && !directViewers.includes(x.reference.toString())))
  rights._expander = rights._expander?.filter(x => x.inherited === undefined || (x.inherited === true && !directExpanders.includes(x.reference.toString())))
  rights._editor = rights._editor?.filter(x => x.inherited === undefined || (x.inherited === true && !directEditors.includes(x.reference.toString())))
  rights._owner = rights._owner?.filter(x => x.inherited === undefined || (x.inherited === true && !directOwners.includes(x.reference.toString())))

  const noRights = rights._noaccess?.map(x => x.reference.toString()) || []

  if (noRights.length > 0) {
    rights._viewer = rights._viewer?.filter(x => !noRights.includes(x.reference.toString()))
    rights._expander = rights._expander?.filter(x => !noRights.includes(x.reference.toString()))
    rights._editor = rights._editor?.filter(x => !noRights.includes(x.reference.toString()))
    rights._owner = rights._owner?.filter(x => !noRights.includes(x.reference.toString()))
  }

  return rights
}

function getAccessArray ({ private: entity }) {
  const access = []
  const noAccess = entity._noaccess?.map(x => x.reference)

  if (entity._sharing?.at(0)?.string) {
    access.push(entity._sharing?.at(0)?.string.toLowerCase())
  }

  ['_viewer', '_expander', '_editor', '_owner'].forEach((type) => {
    if (!entity[type]) return

    entity[type].forEach((x) => {
      if (noAccess?.includes(x.reference)) return

      access.push(x.reference)
    })
  })

  return uniqBy(access, x => x.toString())
}

function makeSearchArray (array) {
  if (!array || array.length === 0) return []

  const result = []

  for (const str of array) {
    const words = `${str}`.toLowerCase().split(/\s+/).map(x => x.trim()).filter(x => x.length > 0)

    for (const word of words) {
      for (let i = 0; i < word.length; i++) {
        for (let j = i + 1; j <= word.length; j++) {
          result.push(word.slice(i, j))
        }
      }
    }
  }

  return [...new Set(result)].sort()
}

function uniqBy (array, keyFn) {
  return array.filter((v, i, a) =>
    a.findIndex(t => keyFn(t) === keyFn(v)) === i
  )
}

async function startRelativeAggregation (entu, entity, newEntity) {
  let notEqual = false
  const rights = ['_noaccess', '_viewer', '_expander', '_editor', '_owner']

  const oldName = entity.private?.name?.map(x => x.string || '') || []
  const newName = newEntity.private?.name?.map(x => x.string || '') || []

  oldName.sort()
  newName.sort()

  notEqual = notEqual || oldName.join('') !== newName.join('')

  rights.forEach((type) => {
    const oldRights = entity.private?.[type]?.map(x => x.reference?.toString()) || []
    const newRights = newEntity.private?.[type]?.map(x => x.reference?.toString()) || []

    oldRights.sort()
    newRights.sort()

    notEqual = notEqual || oldRights.join('') !== newRights.join('')
  })

  if (!notEqual) return 0

  const referrers = await entu.db.collection('property').aggregate([
    { $match: { reference: entity._id, deleted: { $exists: false } } },
    { $group: { _id: '$entity' } }
  ]).toArray()

  for (let j = 0; j < referrers.length; j++) {
    await addAggregateQueue(entu, referrers[j]._id)
  }

  return referrers.length
}
