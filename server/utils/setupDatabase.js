const reservedDatabases = [
  'admin',
  'api',
  'argo',
  'argoroots',
  'arx_raamat',
  'arx',
  'auth',
  'billing',
  'collection',
  'config',
  'database',
  'dev',
  'develop',
  'eka',
  'entity',
  'local',
  'new',
  'property',
  'raamatukogu',
  'stripe',
  'template',
  'test'
]

const defaultTypes = [
  'database',
  'entity',
  'menu',
  'person',
  'plugin',
  'property'
]

// Returns true if the name passes all rules (length, reserved list, entu_ prefix) and does not already exist as a MongoDB database
export async function isAvailableDatabase (name, db) {
  const sanitized = formatDatabaseName(name)

  if (
    !sanitized
    || sanitized.length < 4
    || sanitized.length > 12
    || sanitized.startsWith('entu_')
    || reservedDatabases.includes(sanitized)
  ) return false

  const { databases } = await db.admin().listDatabases()

  return !databases.some((x) => x.name === sanitized)
}

// Sets up a brand new database: indexes, template entities, person entity with invite token, database entity with billing info, rights and final aggregation
export async function initializeNewDatabase (entu, reservation, billingCustomerId) {
  await createDatabaseIndexes(entu.db)

  const newTypes = await getTypes()
  const newMenus = await getMenus()
  const newPlugins = await getPlugins()

  await createEntities(entu, [...newTypes, ...newMenus, ...newPlugins])

  // Find person entity type
  const { _id: personTypeId } = await entu.db.collection('entity').findOne({
    'private._type.string': 'entity',
    'private.name.string': 'person'
  }, { projection: { _id: true } })

  // Create person entity after types exist — setEntity auto-generates { db, entityId } invite JWT
  const personProps = [
    { type: '_type', reference: personTypeId },
    { type: '_sharing', string: 'private' },
    { type: 'entu_user', string: entu.account }
  ]

  if (reservation.name) {
    const nameParts = reservation.name.trim().split(/\s+/)
    const forename = nameParts.slice(0, -1).join(' ') || nameParts.at(0)
    const surname = nameParts.length > 1 ? nameParts.at(-1) : null

    personProps.push({ type: 'forename', string: forename })
    if (surname) personProps.push({ type: 'surname', string: surname })
  }

  if (reservation.email) personProps.push({ type: 'email', string: reservation.email })

  const person = await setEntity(entu, null, personProps)

  const personId = person._id

  await setEntity(entu, personId, [{ type: '_owner', reference: personId }])

  const personEntity = await entu.db.collection('entity').findOne(
    { _id: personId },
    { projection: { 'private.entu_user.invite': true } }
  )
  const inviteToken = personEntity.private.entu_user.at(0).invite

  // Create database entity
  const { _id: databaseTypeId } = await entu.db.collection('entity').findOne({
    'private._type.string': 'entity',
    'private.name.string': 'database'
  }, { projection: { _id: true } })

  const dbProps = [
    { type: '_type', reference: databaseTypeId },
    { type: '_sharing', string: 'domain' },
    { type: '_inheritrights', boolean: true },
    { type: '_editor', reference: personId },
    { type: 'name', string: entu.account }
  ]

  if (reservation.email) {
    dbProps.push({ type: 'email', string: reservation.email })
  }

  if (reservation.plan) {
    dbProps.push({ type: 'plan', string: reservation.plan })
  }

  if (billingCustomerId) {
    dbProps.push({ type: 'billing_customer_id', string: billingCustomerId })
  }

  const { _id: newDatabaseId } = await setEntity(entu, undefined, dbProps)

  // Add database as parent to all entities without one
  const noParents = await entu.db.collection('entity').find({
    _id: { $ne: newDatabaseId },
    'private._parent.reference': { $exists: false }
  }, { projection: { _id: true }, sort: { _id: 1 } }).toArray()

  await Promise.all(noParents.map((x) =>
    setEntity(entu, x._id, [
      { type: '_parent', reference: newDatabaseId }
    ])
  ))

  // Add rights to person
  const noRights = await entu.db.collection('entity').find({
    $or: [{
      'private._type.string': 'entity',
      'private.system._id': { $exists: false }
    }, {
      'private._type.string': 'menu'
    }, {
      'private._type.string': 'plugin'
    }]
  }, { projection: { _id: true }, sort: { _id: 1 } }).toArray()

  await Promise.all(noRights.map((x) =>
    setEntity(entu, x._id, [
      { type: '_owner', reference: personId }
    ])
  ))

  const allEntities = await entu.db.collection('entity').find({}, { sort: { _id: 1 } }).toArray()

  // Delete dangling reference properties
  await entu.db.collection('property').deleteMany({
    $and: [
      { reference: { $exists: true } },
      { reference: { $nin: allEntities.map((x) => x._id) } }
    ]
  })

  // Final aggregation
  await Promise.all(allEntities.map((x) =>
    aggregateEntity(entu, x._id)
  ))

  return inviteToken
}

// Creates all required indexes on entity, property and stats collections for a new database
async function createDatabaseIndexes (db) {
  await Promise.all([
    db.collection('entity').createIndexes([
      { key: { 'private._parent.reference': 1 } },
      { key: { 'private._reference.reference': 1 } },
      { key: { 'private._type.string': 1 } },
      { key: { 'private.add_from.reference': 1 } },
      { key: { 'private.entu_api_key.string': 1 } },
      { key: { 'private.entu_passkey.passkey_id': 1 } },
      { key: { 'private.entu_user.invite': 1 } },
      { key: { 'private.entu_user.string': 1 } },
      { key: { 'private.entu_user.uid': 1, 'private.entu_user.provider': 1 } },
      { key: { 'private.formula.string': 1 }, sparse: true },
      { key: { 'private.name.string': 1 } },
      { key: { 'search.domain': 1 } },
      { key: { 'search.private': 1 } },
      { key: { 'search.public': 1 } },
      { key: { access: 1 } },
      { key: { queued: 1 }, sparse: true }
    ]),

    db.collection('property').createIndexes([
      { key: { 'created.by': 1 } },
      { key: { 'deleted.by': 1 } },
      { key: { deleted: 1 } },
      { key: { entity: 1, type: 1, deleted: 1 } },
      { key: { filesize: 1 } },
      { key: { reference: 1, deleted: 1 } },
      { key: { type: 1, deleted: 1, number: -1 } }
    ]),

    db.collection('stats').createIndex(
      { date: 1, function: 1 },
      { unique: true }
    )
  ])
}

// Inserts template entities into the new database, rewrites old template ObjectId references to new ones, and aggregates all entities
async function createEntities (entu, entities) {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]

    const { insertedId } = await entu.db.collection('entity').insertOne({ oid: entity._id })

    const properties = entity.properties.map((property) => ({
      entity: insertedId,
      ...property,
      created: {
        at: new Date()
      }
    }))

    await entu.db.collection('property').insertMany(properties)
  }

  const allEntities = await entu.db.collection('entity').find({}, { sort: { _id: 1 } }).toArray()

  await Promise.all(allEntities.map((x) =>
    entu.db.collection('property').updateMany(
      { reference: x.oid },
      { $set: { reference: x._id } }
    )
  ))

  // First pass: populates private.name.string for all entities (direct string properties, no cross-entity lookup)
  await Promise.all(allEntities.map((x) =>
    aggregateEntity(entu, x._id)
  ))

  // Second pass: resolves private._type.string and other reference lookups that depend on
  // private.name.string of other entities being written to the DB (populated by the first pass)
  await Promise.all(allEntities.map((x) =>
    aggregateEntity(entu, x._id)
  ))
}

// Fetches all default entity type definitions from the template database
async function getTypes () {
  const templateDb = await connectDb('template')
  const entities = await templateDb.collection('entity').find({
    'private._type.string': 'entity',
    'private.name.string': { $in: defaultTypes }
  }, { projection: { _id: true } }).toArray()

  const result = await Promise.all(entities.map((x) =>
    getEntity(templateDb, x._id, ['_parent'])
  ))

  return result.flat()
}

// Fetches all menu definitions matching the default types from the template database
async function getMenus () {
  const typesFilter = defaultTypes.map((x) => ({ 'private.query.string': { $regex: `.*_type.string=${x}.*` } }))

  typesFilter.push({ 'private.query.string': { $regex: '.*/billing.*' } })

  const templateDb = await connectDb('template')
  const entities = await templateDb.collection('entity').find({
    'private._type.string': 'menu',
    $or: typesFilter
  }, { projection: { _id: true } }).toArray()

  const result = await Promise.all(entities.map((x) =>
    getEntity(templateDb, x._id, ['_parent'])
  ))

  return result.flat()
}

// Fetches all plugin definitions from the template database
async function getPlugins () {
  const templateDb = await connectDb('template')
  const entities = await templateDb.collection('entity').find({
    'private._type.string': 'plugin'
  }, { projection: { _id: true } }).toArray()

  const result = await Promise.all(entities.map((x) =>
    getEntity(templateDb, x._id, ['_parent'])
  ))

  return result.flat()
}

// Reads a single entity and its properties from the template database, excluding specified property types and system properties
async function getEntity (db, _id, noProperties = []) {
  const [entity, properties, childs] = await Promise.all([
    db.collection('entity').findOne({ _id }, {
      projection: {
        _id: true,
        'private._type.string': true,
        'private.name.string': true
      }
    }),
    db.collection('property').find({
      entity: _id,
      deleted: { $exists: false },
      type: {
        $nin: [
          '_mid',
          ...noProperties
        ]
      }
    }, {
      projection: {
        _id: false,
        entity: false
      }
    }).toArray(),
    getChilds(db, _id)
  ])

  return [
    {
      _id: entity._id,
      type: entity.private?._type?.at(0)?.string,
      name: entity.private?.name?.at(0)?.string,
      properties
    },
    ...childs.flat()
  ]
}

// Recursively fetches child entities from the template database, excluding legacy entity types not used in new databases
async function getChilds (db, _id) {
  const childs = await db.collection('entity').find({
    'private._parent.reference': _id,
    'private._type.string': {
      $nin: [
        'acceptance_report',
        'gender',
        'inventory_number',
        'invoice',
        'mahakandmisakt'
      ]
    }
  }, { projection: { _id: true } }).toArray()

  return await Promise.all(childs.map((child) =>
    getEntity(db, child._id)
  ))
}
