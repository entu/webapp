import { createHash, randomBytes } from 'node:crypto'
import jwt from 'jsonwebtoken'

const charsForKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_=+'

// Validates, processes, and persists properties to a new or existing entity
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

  validateInput(properties)
  await checkEntityAccess(entu, entityId, properties, rightTypes)
  await validatePropertyTypes(entu, properties, allowedTypes)

  if (!entityId) {
    await applyDefaultParents(entu, properties, createdDt)
    await inheritParentProperties(entu, properties, createdDt)
    entityId = await createEntityRecord(entu, properties, createdDt)
  }

  const { pIds, oldPIds } = await insertProperties(entu, entityId, properties, createdDt)

  await markPropertiesDeleted(entu, entityId, oldPIds)
  await aggregateEntity(entu, entityId)

  return { _id: entityId, properties: pIds }
}

// Throws if properties is missing, not an array, or empty
function validateInput (properties) {
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
}

// Verifies the user has editor or owner access to an existing entity
async function checkEntityAccess (entu, entityId, properties, rightTypes) {
  if (!entityId) return

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

// Validates each property's type name and _parent references
async function validatePropertyTypes (entu, properties, allowedTypes) {
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
    }
  }
}

// Pushes default _parent entries based on the entity's _type definition
async function applyDefaultParents (entu, properties, createdDt) {
  const entityType = properties.find((x) => x.type === '_type' && x.reference)

  if (!entityType) return

  const defaultParents = await entu.db.collection('entity').findOne(
    { _id: getObjectId(entityType.reference), 'private.default_parent': { $exists: true } },
    { projection: { 'private.default_parent': true } }
  )

  if (defaultParents) {
    defaultParents.private.default_parent.forEach((parent) => {
      properties.push({
        type: '_parent',
        reference: parent.reference,
        created: { at: createdDt, by: entu.user || 'entu' }
      })
    })
  }
}

// Inherits _sharing and _inheritrights from parent entities
async function inheritParentProperties (entu, properties, createdDt) {
  const parentReferences = properties.filter((x) => x.type === '_parent' && x.reference).map((x) => x.reference)

  if (parentReferences.length === 0) return

  // Inherit _sharing from any parent (direct or default_parent)
  if (!properties.find((x) => x.type === '_sharing')) {
    const parents = await entu.db.collection('entity').find(
      { _id: { $in: parentReferences.map(getObjectId) } },
      { projection: { 'private._sharing': true } }
    ).toArray()

    const parentSharings = parents
      .map((p) => p.private?._sharing?.at(0)?.string)
      .filter(Boolean)

    if (parentSharings.includes('public')) {
      properties.push({ type: '_sharing', string: 'public', created: { at: createdDt, by: entu.user || 'entu' } })
    }
    else if (parentSharings.includes('domain')) {
      properties.push({ type: '_sharing', string: 'domain', created: { at: createdDt, by: entu.user || 'entu' } })
    }
  }

  // Inherit _inheritrights from any parent (direct or default_parent)
  if (!properties.find((x) => x.type === '_inheritrights')) {
    const parentsWithInheritRights = await entu.db.collection('entity').find(
      { _id: { $in: parentReferences.map(getObjectId) }, 'private._inheritrights.boolean': true },
      { projection: { _id: true } }
    ).toArray()

    if (parentsWithInheritRights.length > 0) {
      properties.push({ type: '_inheritrights', boolean: true, created: { at: createdDt, by: entu.user || 'entu' } })
    }
  }
}

// Inserts a new entity document and pushes _owner and _created system properties
async function createEntityRecord (entu, properties, createdDt) {
  const entity = await entu.db.collection('entity').insertOne({})
  const entityId = entity.insertedId

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

  return entityId
}

// Processes and inserts all properties, returning inserted pIds and replaced oldPIds
async function insertProperties (entu, entityId, properties, createdDt) {
  const pIds = []
  const oldPIds = []

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]
    let apiKey

    if (property._id) {
      oldPIds.push(getObjectId(property._id))

      delete property._id
    }
    if (property.reference) {
      property.reference = getObjectId(property.reference)
    }
    if (property.date) {
      property.date = new Date(property.date)
    }
    if (property.datetime) {
      property.datetime = new Date(property.datetime)
    }
    if (property.counter) {
      const nextCounter = await getNextCounterValue(entu, property)

      property.string = nextCounter.string
      property.number = nextCounter.number

      delete property.counter
    }
    if (property.type === 'entu_user' && property.string) {
      const { jwtSecret } = useRuntimeConfig()

      property.invite = jwt.sign({ db: entu.account, entityId: entityId.toString() }, jwtSecret, { expiresIn: '7d' })

      delete property.string
    }
    if (property.type === 'entu_api_key') {
      apiKey = Array.from(randomBytes(32), (byte) => charsForKey[byte % charsForKey.length]).join('')

      property.string = createHash('sha256').update(apiKey).digest('hex')
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

    if (apiKey) {
      newProperty.string = apiKey
    }

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

  return { pIds, oldPIds }
}

// Returns the next counter string/number for a counter-type property
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

    if (lastProperty.length === 0) {
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

// Soft-deletes replaced properties by setting their deleted field
async function markPropertiesDeleted (entu, entityId, oldPIds) {
  if (oldPIds.length === 0) return

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

// Returns the public, domain, or private view of an entity based on user access rights
export async function cleanupEntity (entu, entity, _thumbnail) {
  if (!entity) return

  let result = { _id: entity._id }

  if (entu.userStr && entity.access?.map((x) => x.toString())?.includes(entu.userStr)) {
    result = { ...result, ...entity.private }
  }
  else if (entu.userStr && entity.access?.includes('domain')) {
    result = { ...result, ...entity.domain }
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

  if (result.entu_user) {
    result.entu_user.forEach((u) => {
      if (u.invite) {
        u.invite = '***'
      }
      else if (u.email?.endsWith('@eesti.ee')) {
        u.email = u.email.replace('@eesti.ee', '')
      }
    })
  }

  if (result.entu_passkey) {
    result.entu_passkey.forEach((k) => {
      k.string = `${k.passkey_device || ''} ${k._id.toString().slice(-4).toUpperCase()}`.trim()
    })
  }

  if (!result._thumbnail) {
    delete result._thumbnail
  }

  return result
}
