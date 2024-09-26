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
const optionalTypes = [
  'audiovideo',
  'book',
  'department',
  'document',
  'folder',
  'lending'
]

export default defineEventHandler(async (event) => {
  const { token } = event.context.entu
  const body = await readBody(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No token'
    })
  }

  if (typeof body.database !== 'string' || !body.database) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No database'
    })
  }

  if (body.types !== undefined && !Array.isArray(body.types)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid types'
    })
  }

  if (typeof body.name !== 'string' || !body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No name'
    })
  }

  if (typeof body.email !== 'string' || !body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No email'
    })
  }

  const databaseName = formatDatabaseName(body.database)
  const entu = {
    account: databaseName,
    db: await newDatabase(databaseName),
    systemUser: true
  }

  const newTypes = await getTypes(body.types)
  const newMenus = await getMenus(body.types)
  const newPlugins = await getPlugins()

  await createEntities(entu, [...newTypes, ...newMenus, ...newPlugins])

  // Create new person entity
  const { _id: personTypeId } = await entu.db.collection('entity').findOne({
    'private._type.string': 'entity',
    'private.name.string': 'person'
  }, { projection: { _id: true } })

  const { _id: newPersonId } = await setEntity(entu, undefined, [
    { type: '_type', reference: personTypeId },
    { type: '_sharing', string: 'private' },
    { type: 'entu_user', string: body.email },
    { type: 'email', string: body.email },
    { type: 'forename', string: body.name.split(' ').slice(0, -1).join(' ') },
    { type: 'surname', string: body.name.split(' ').at(-1) }
  ])

  await setEntity(entu, newPersonId, [
    { type: '_owner', reference: newPersonId }
  ])

  // Create new database entity
  const { _id: databaseTypeId } = await entu.db.collection('entity').findOne({
    'private._type.string': 'entity',
    'private.name.string': 'database'
  }, { projection: { _id: true } })

  const { _id: newDatabaseId } = await setEntity(entu, undefined, [
    { type: '_type', reference: databaseTypeId },
    { type: '_sharing', string: 'domain' },
    { type: '_inheritrights', boolean: true },
    { type: '_editor', reference: newPersonId },
    { type: 'name', string: databaseName }
  ])

  // Add database as parent to all entities
  const noParents = await entu.db.collection('entity').find({
    _id: { $ne: newDatabaseId },
    'private._parent.reference': { $exists: false }
  }, { projection: { _id: true }, sort: { _id: 1 } }).toArray()

  await Promise.all(noParents.map(x =>
    setEntity(entu, x._id, [
      { type: '_parent', reference: newDatabaseId }
    ])
  ))

  // Add rights to new person
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

  await Promise.all(noRights.map(x =>
    setEntity(entu, x._id, [
      { type: '_owner', reference: newPersonId }
    ])
  ))

  const allEntities = await entu.db.collection('entity').find({}, { sort: { _id: 1 } }).toArray()

  // Delete all reference properties that are not related to any entity
  await entu.db.collection('property').deleteMany({
    $and: [
      { reference: { $exists: true } },
      { reference: { $nin: allEntities.map(x => x._id) } }
    ]
  })

  // Aggregate all entities
  await Promise.all(allEntities.map(x =>
    aggregateEntity(entu, x._id)
  ))

  return {
    database: databaseName,
    person: newPersonId
  }
})

async function newDatabase (name) {
  if (
    typeof name !== 'string' ||
    name.length < 4 ||
    name.length > 12 ||
    reservedDatabases.includes(name) ||
    name.startsWith('entu_')
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid database name'
    })
  }

  const newDb = await connectDb(name, true)
  const { databases } = await newDb.admin().listDatabases()

  if (databases.some(db => db.name === name)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid database name'
    })
  }

  await Promise.all([
    // Add entity indexes to MongoDB
    newDb.collection('entity').createIndexes([
      { key: { oid: 1 } },
      { key: { access: 1 } },
      { key: { 'private._parent.reference': 1 } },
      { key: { 'private._type.string': 1 } },
      { key: { 'private.add_from.reference': 1 } },
      { key: { 'private.entu_api_key.string': 1 } },
      { key: { 'private.entu_user.string': 1 } },
      { key: { 'private.name.string': 1 } },
      { key: { 'search.private': 1 } },
      { key: { 'search.domain': 1 } },
      { key: { 'search.public': 1 } }
    ]),

    // Add property indexes to MongoDB
    newDb.collection('property').createIndexes([
      { key: { entity: 1 } },
      { key: { type: 1 } },
      { key: { deleted: 1 } },
      { key: { reference: 1 } },
      { key: { filesize: 1 } },
      { key: { 'created.by': 1 } },
      { key: { 'deleted.by': 1 } }
    ]),

    // Add stats indexes to MongoDB
    newDb.collection('stats').createIndex(
      { date: 1, function: 1 },
      { unique: true }
    )
  ])

  return newDb
}

async function getTypes (types = []) {
  const templateDb = await connectDb('template')
  const entities = await templateDb.collection('entity').find({
    'private._type.string': 'entity',
    'private.name.string': {
      $in: [
        ...defaultTypes,
        ...optionalTypes.filter(x => types.includes(x))
      ]
    }
  }, { projection: { _id: true } }).toArray()

  const result = await Promise.all(entities.map(x =>
    getEntity(templateDb, x._id, ['_parent'])
  ))

  return result.flat()
}

async function getMenus (types = []) {
  const typesFilter = [
    ...defaultTypes,
    ...optionalTypes.filter(x => types.includes(x))
  ].map(x => ({ 'private.query.string': { $regex: `.*_type.string=${x}.*` } }))

  typesFilter.push({ 'private.query.string': { $regex: '.*/billing.*' } })

  const templateDb = await connectDb('template')
  const entities = await templateDb.collection('entity').find({
    'private._type.string': 'menu',
    $or: typesFilter
  }, { projection: { _id: true } }).toArray()

  const result = await Promise.all(entities.map(x =>
    getEntity(templateDb, x._id, ['_parent'])
  ))

  return result.flat()
}

async function getPlugins () {
  const templateDb = await connectDb('template')
  const entities = await templateDb.collection('entity').find({
    'private._type.string': 'plugin'
  }, { projection: { _id: true } }).toArray()

  const result = await Promise.all(entities.map(x =>
    getEntity(templateDb, x._id, ['_parent'])
  ))

  return result.flat()
}

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

  return await Promise.all(childs.map(child =>
    getEntity(db, child._id)
  ))
}

async function createEntities (entu, entities) {
  // Create entities
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]

    const { insertedId } = await entu.db.collection('entity').insertOne({ oid: entity._id })

    const properties = entity.properties.map(property => ({
      entity: insertedId,
      ...property,
      created: {
        at: new Date()
      }
    }))

    await entu.db.collection('property').insertMany(properties)
  }

  const allEntities = await entu.db.collection('entity').find({}, { sort: { _id: 1 } }).toArray()

  // Update old references to new references
  await Promise.all(allEntities.map(x =>
    entu.db.collection('property').updateMany(
      { reference: x.oid },
      { $set: { reference: x._id } }
    )
  ))

  // Aggregate all entities
  await Promise.all(allEntities.map(x =>
    aggregateEntity(entu, x._id)
  ))

  // Aggregate all entities again
  await Promise.all(allEntities.map(x =>
    aggregateEntity(entu, x._id)
  ))
}
