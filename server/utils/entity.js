import { createHash } from 'node:crypto'

// Return public or private properties (based user rights)
export async function cleanupEntity (entu, entity, _thumbnail) {
  if (!entity) return

  let result = { _id: entity._id }

  if (entu.userStr && entity.access?.map((x) => x.toString())?.includes(entu.userStr)) {
    result = { ...result, ...entity.private }
  }
  else if (entu.userStr && entity.access?.includes('domain')) {
    result = { ...result, ...entity.public, ...entity.domain, ...entity.private } // must set to domain only after all is aggregated
  }
  else if (entity.access?.includes('public')) {
    result = { ...result, ...entity.public }
  }
  else {
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

    const access = entity.private?._editor?.map((s) => s.reference?.toString()) || []

    if (!access.includes(entu.userStr) && !entu.systemUser) {
      throw createError({
        statusCode: 403,
        statusMessage: 'User not in _owner nor _editor property'
      })
    }

    const rigtsProperties = properties.filter((property) => rightTypes.includes(property.type))
    const owners = entity.private?._owner?.map((s) => s.reference?.toString()) || []

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

      const parentAccess = parent.private?._expander?.map((s) => s.reference?.toString()) || []

      if (!parentAccess.includes(entu.userStr) && !entu.systemUser) {
        throw createError({
          statusCode: 400,
          statusMessage: 'User not in parent _owner, _editor nor _expander property'
        })
      }

      if (parent.private?._sharing?.at(0).string && !properties.some((x) => x.type === '_sharing')) {
        properties.push({
          entity: entityId,
          type: '_sharing',
          string: parent.private?._sharing.at(0).string.toLowerCase(),
          created: { at: createdDt, by: entu.user || 'entu' }
        })
      }

      if (parent.private?._inheritrights?.at(0)?.boolean === true && !properties.some((x) => x.type === '_inheritrights')) {
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
    const entityType = properties.find((x) => x.type === '_type' && x.reference)

    if (entityType) {
      const defaultParents = await entu.db.collection('entity').findOne({ _id: getObjectId(entityType.reference), 'private.default_parent': { $exists: true } }, { projection: { 'private.default_parent': true } })

      if (defaultParents) {
        defaultParents.private.default_parent.forEach((parent) => {
          properties.push({
            entity: entityId,
            type: '_parent',
            reference: parent.reference,
            created: { at: createdDt, by: entu.user || 'entu' }
          })
        })
      }
    }

    const entity = await entu.db.collection('entity').insertOne({})
    entityId = entity.insertedId

    if (entu.user) {
      properties.push({
        entity: entityId,
        type: '_owner',
        reference: entu.user,
        created: { at: createdDt, by: entu.user }
      })
      properties.push({
        entity: entityId,
        type: '_created',
        reference: entu.user,
        datetime: createdDt,
        created: { at: createdDt, by: entu.user }
      })
    }
    else {
      properties.push({
        entity: entityId,
        type: '_created',
        datetime: createdDt,
        created: { at: createdDt, by: 'entu' }
      })
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
    if (property.counter) {
      const nextCounter = await getNextCounterValue(entu, property)

      property.string = nextCounter.string
      property.number = nextCounter.number

      delete property.counter
    }

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
          'Content-Length': property.filesize,
          'Content-Type': property.filetype
        }
      }
    }

    pIds.push(newProperty)
  }

  if (oldPIds.length > 0) {
    await entu.db.collection('property').updateMany({
      _id: { $in: oldPIds },
      entity: entityId,
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

export async function addAggregateQueue (entu, entityIds) {
  await entu.db.collection('entity').updateMany({
    _id: { $in: entityIds }
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

    if (parentRights._viewer) { newEntity.private._parent_viewer = uniqBy(parentRights._viewer, (x) => x.reference.toString()) }
    if (parentRights._expander) { newEntity.private._parent_expander = uniqBy(parentRights._expander, (x) => x.reference.toString()) }
    if (parentRights._editor) { newEntity.private._parent_editor = uniqBy(parentRights._editor, (x) => x.reference.toString()) }
    if (parentRights._owner) { newEntity.private._parent_owner = uniqBy(parentRights._owner, (x) => x.reference.toString()) }
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

async function formula (entu, str, entityId) {
  const strArray = str.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)

  const func = formulaFunction(strArray)
  const data = formulaContent(strArray, func)

  let valueArray = []

  for (let i = 0; i < data.length; i++) {
    const value = await formulaField(entu, data[i], entityId)

    if (value !== undefined && value !== null) {
      valueArray = [...valueArray, ...value]
    }
  }

  valueArray = await getValueArray(entu, valueArray)

  if (valueArray.length === 0 && !['COUNT', 'SUM'].includes(func)) {
    return undefined
  }

  switch (func) {
    case 'COUNT':
      return { number: valueArray.length }
    case 'SUM':
      return { number: valueArray.reduce((a, b) => a + b, 0) }
    case 'SUBTRACT':
      return { number: valueArray.slice(1).reduce((a, b) => a - b, valueArray.at(0)) }
    case 'AVERAGE':
      return { number: valueArray.reduce((a, b) => a + b, 0) / valueArray.length }
    case 'MIN':
      return { number: Math.min(...valueArray) }
    case 'MAX':
      return { number: Math.max(...valueArray) }
    case 'CONCAT_WS':
      return { string: valueArray.slice(0, -1).join(valueArray.at(-1)) }
    default: // CONCAT
      return { string: valueArray.join('') }
  }
}

async function formulaField (entu, str, entityId) {
  str = str.trim()

  if ((str.startsWith('\'') || str.startsWith('"')) && (str.endsWith('\'') || str.endsWith('"'))) {
    return [{
      string: str.substring(1, str.length - 1)
    }]
  }

  if (parseFloat(str).toString() === str) {
    return [{
      number: parseFloat(str)
    }]
  }

  const strParts = str.split('.').filter((x) => x !== undefined)
  const [fieldRef, fieldType, fieldProperty] = strParts

  let result

  if (strParts.length === 1 && str === '_id') { // same entity _id
    result = [{ _id: entityId }]
  }
  else if (strParts.length === 1 && str !== '_id') { // same entity property
    result = await entu.db.collection('property').find({
      entity: entityId,
      type: str,
      deleted: { $exists: false }
    }, {
      projection: { _id: true, entity: false, type: false, created: false }
    }).toArray()
  }
  else if (strParts.length === 3 && fieldRef === '_child' && fieldType === '*' && fieldProperty === '_id') { // childs _id
    result = await entu.db.collection('entity').find({
      'private._parent.reference': entityId
    }, {
      projection: { _id: true }
    }).toArray()
  }
  else if (strParts.length === 3 && fieldRef === '_child' && fieldType !== '*' && fieldProperty === '_id') { // childs (with type) property
    result = await entu.db.collection('entity').find({
      'private._parent.reference': entityId,
      'private._type.string': fieldType
    }, {
      projection: { _id: true }
    }).toArray()
  }
  else if (strParts.length === 3 && fieldRef === '_child' && fieldType === '*' && fieldProperty !== '_id') { // childs property
    result = await entu.db.collection('entity').aggregate([{
      $match: {
        'private._parent.reference': entityId
      }
    }, {
      $project: {
        property: `$private.${fieldProperty}`
      }
    }, {
      $unwind: '$property'
    }, {
      $replaceWith: '$property'
    }]).toArray()
  }
  else if (strParts.length === 3 && fieldRef === '_child' && fieldType !== '*' && fieldProperty !== '_id') { // childs (with type) property
    result = await entu.db.collection('entity').aggregate([{
      $match: {
        'private._parent.reference': entityId,
        'private._type.string': fieldType
      }
    }, {
      $project: {
        property: `$private.${fieldProperty}`
      }
    }, {
      $unwind: '$property'
    }, {
      $replaceWith: '$property'
    }]).toArray()
  }
  else if (strParts.length === 3 && fieldRef !== '_child' && fieldType === '*' && fieldProperty === '_id') { // other reference _id
    result = await entu.db.collection('property').aggregate([{
      $match: {
        entity: entityId,
        type: fieldRef,
        reference: { $exists: true },
        deleted: { $exists: false }
      }
    }, {
      $project: { _id: '$reference' }
    }]).toArray()
  }
  else if (strParts.length === 3 && fieldRef !== '_child' && fieldType !== '*' && fieldProperty === '_id') { // other reference (with type) _id
    result = await entu.db.collection('property').aggregate([{
      $match: {
        entity: entityId,
        type: fieldRef,
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
        as: 'references'
      }
    }, {
      $unwind: '$references'
    }, {
      $replaceWith: '$references'
    }]).toArray()
  }
  else if (strParts.length === 3 && fieldRef !== '_child' && fieldType === '*' && fieldProperty !== '_id') { // other reference property
    result = await entu.db.collection('property').aggregate([{
      $match: {
        entity: entityId,
        type: fieldRef,
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
              $expr: { $eq: ['$_id', '$$entityId'] }
            }
          }, {
            $project: { property: `$private.${fieldProperty}` }
          }
        ],
        as: 'references'
      }
    }, {
      $project: {
        property: '$references.property'
      }
    }, {
      $unwind: '$property'
    }, {
      $unwind: '$property'
    }, {
      $replaceWith: '$property'
    }]).toArray()
  }
  else if (strParts.length === 3 && fieldRef !== '_child' && fieldType !== '*' && fieldProperty !== '_id') { // other references(with type) property
    result = await entu.db.collection('property').aggregate([{
      $match: {
        entity: entityId,
        type: fieldRef,
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
            $project: { property: `$private.${fieldProperty}` }
          }
        ],
        as: 'references'
      }
    }, {
      $project: {
        property: '$references.property'
      }
    }, {
      $unwind: '$property'
    }, {
      $unwind: '$property'
    }, {
      $replaceWith: '$property'
    }]).toArray()
  }

  return result
}

function formulaFunction (data) {
  const func = data.at(-1)

  if (['CONCAT', 'CONCAT_WS', 'COUNT', 'SUM', 'SUBTRACT', 'AVERAGE', 'MIN', 'MAX'].includes(func)) {
    return func
  }
  else {
    return 'CONCAT'
  }
}

function formulaContent (data, func) {
  if (data.at(-1) === func) {
    return data.slice(0, -1)
  }
  else {
    return data
  }
}

async function getValueArray (entu, values) {
  if (!values) return []

  return await Promise.all(values.map(async (x) => {
    try {
      if (x.number !== undefined && x.number !== null) return x.number
      if (x.datetime !== undefined && x.datetime !== null) return x.datetime?.toISOString()
      if (x.date !== undefined && x.date !== null) return x.date?.toISOString().substring(0, 10)
      if (x.string !== undefined && x.string !== null) return x.string
      if (x.reference !== undefined && x.reference !== null) {
        const entity = await entu.db.collection('entity').findOne({ _id: x.reference }, { projection: { 'private.name': true } })

        return entity.private?.name?.at(0)?.string || x.reference
      }

      return x._id
    }
    catch (error) {
      loggerError(`getValueArray ${x._id} ${error}`, entu)

      return x._id
    }
  }))
}

async function getParentRights (entu, parents) {
  const parentRights = await entu.db.collection('entity').find({
    _id: { $in: parents.map((x) => x.reference) }
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
    _viewer: [...acc._viewer || [], ...cur.private?._viewer || []],
    _expander: [...acc._expander || [], ...cur.private?._expander || []],
    _editor: [...acc._editor || [], ...cur.private?._editor || []],
    _owner: [...acc._owner || [], ...cur.private?._owner || []]
  }), {
    _viewer: [],
    _expander: [],
    _editor: [],
    _owner: []
  }))

  rights._noaccess = rights._noaccess?.map((x) => ({ ...x, inherited: true }))
  rights._viewer = rights._viewer?.map((x) => ({ ...x, inherited: true }))
  rights._expander = rights._expander?.map((x) => ({ ...x, inherited: true }))
  rights._editor = rights._editor?.map((x) => ({ ...x, inherited: true }))
  rights._owner = rights._owner?.map((x) => ({ ...x, inherited: true }))

  return rights
}

function combineRights (rights) {
  const directNoaccess = rights._noaccess?.filter((x) => x.inherited === undefined)?.map((x) => x.reference.toString()) || []
  const directViewers = rights._viewer?.filter((x) => x.inherited === undefined)?.map((x) => x.reference.toString()) || []
  const directExpanders = rights._expander?.filter((x) => x.inherited === undefined)?.map((x) => x.reference.toString()) || []
  const directEditors = rights._editor?.filter((x) => x.inherited === undefined)?.map((x) => x.reference.toString()) || []
  const directOwners = rights._owner?.filter((x) => x.inherited === undefined)?.map((x) => x.reference.toString()) || []

  rights._noaccess = rights._noaccess?.filter((x) => x.inherited === undefined || (x.inherited === true && !directNoaccess.includes(x.reference.toString())))
  rights._viewer = rights._viewer?.filter((x) => x.inherited === undefined || (x.inherited === true && !directViewers.includes(x.reference.toString())))
  rights._expander = rights._expander?.filter((x) => x.inherited === undefined || (x.inherited === true && !directExpanders.includes(x.reference.toString())))
  rights._editor = rights._editor?.filter((x) => x.inherited === undefined || (x.inherited === true && !directEditors.includes(x.reference.toString())))
  rights._owner = rights._owner?.filter((x) => x.inherited === undefined || (x.inherited === true && !directOwners.includes(x.reference.toString())))

  const noRights = rights._noaccess?.map((x) => x.reference.toString()) || []

  if (noRights.length > 0) {
    rights._viewer = rights._viewer?.filter((x) => !noRights.includes(x.reference.toString()))
    rights._expander = rights._expander?.filter((x) => !noRights.includes(x.reference.toString()))
    rights._editor = rights._editor?.filter((x) => !noRights.includes(x.reference.toString()))
    rights._owner = rights._owner?.filter((x) => !noRights.includes(x.reference.toString()))
  }

  return rights
}

function getAccessArray ({ private: entity }) {
  const access = []
  const noAccess = entity._noaccess?.map((x) => x.reference)

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

  return uniqBy(access, (x) => x.toString())
}

function makeSearchArray (array) {
  if (!array || array.length === 0) return []

  const result = []

  for (const str of array) {
    const words = `${str}`.toLowerCase().split(/\s+/).map((x) => x.trim()).filter((x) => x.length > 0)

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

function uniqBy (array, keyFn) {
  return array.filter((v, i, a) =>
    a.findIndex((t) => keyFn(t) === keyFn(v)) === i
  )
}

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

    logger(`Aggregation - Name changed`, entu, [`entity:${oldEntity._id}`])

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

    logger(`Aggregation - Rights changed`, entu, [`entity:${oldEntity._id}`])

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

async function getNextCounterValue (entu, property) {
  const regex = /\d+(?!.*\d)/
  const add = typeof property.counter === 'number' ? property.counter : 1

  if (property.string) {
    const match = property.string.match(regex)

    if (match) {
      const number = parseInt(match.at(0), 10)
      return { string: property.string.replace(regex, number), number }
    }
  }
  else {
    const lastProperty = await entu.db.collection('property')
      .find({ type: property.type, deleted: { $exists: false } })
      .sort({ number: -1, _id: -1 })
      .limit(1)
      .toArray()

    if (!lastProperty.length === 0) {
      return { string: `${add}`, number: add }
    }

    const str = lastProperty.at(0).string
    const match = str.match(regex)

    if (match) {
      const number = parseInt(match.at(0), 10) + add
      return { string: str.replace(regex, number), number }
    }
    else {
      return { string: `${str}${add}`, number: add }
    }
  }
}

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
