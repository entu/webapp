// Return public or private properties (based user rights)
export async function claenupEntity (entity, user, _thumbnail) {
  if (!entity) return

  let result = { _id: entity._id }

  if (user && entity.access?.map(x => x.toString())?.includes(user.toString())) {
    result = { ...result, ...entity.private }
  } else if (entity.access?.includes('public')) {
    result = { ...result, ...entity.public }
  } else {
    return
  }

  if (_thumbnail && result.photo?.at(0)?.s3) {
    result._thumbnail = await getSignedDownloadUrl(result.photo.at(0).s3)
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
    '_public',
    '_inheritrights'
  ]

  const rightTypes = [
    '_noaccess',
    '_viewer',
    '_expander',
    '_editor',
    '_owner',
    '_public',
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
        statusMessage: 'Entity not found'
      })
    }

    const access = entity.private?._editor?.map(s => s.reference?.toString()) || []

    if (!access.includes(entu.userStr)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'User not in _owner nor _editor property'
      })
    }

    const rigtsProperties = properties.filter(property => rightTypes.includes(property.type))
    const owners = entity.private?._owner?.map(s => s.reference?.toString()) || []

    if (rigtsProperties.length > 0 && !owners.includes(entu.userStr)) {
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
          'private._public': true,
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

      if (!parentAccess.includes(entu.userStr)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'User not in parent _owner, _editor nor _expander property'
        })
      }

      if (parent.private?._public?.at(0)?.boolean === true && !properties.some(x => x.type === '_public')) {
        properties.push({ entity: entityId, type: '_public', boolean: true, created: { at: createdDt, by: entu.user } })
      }

      if (parent.private?._inheritrights?.at(0)?.boolean === true && !properties.some(x => x.type === '_inheritrights')) {
        properties.push({ entity: entityId, type: '_inheritrights', boolean: true, created: { at: createdDt, by: entu.user } })
      }
    }
  }

  if (!entityId) {
    const entity = await entu.db.collection('entity').insertOne({})
    entityId = entity.insertedId

    properties.push({ entity: entityId, type: '_owner', reference: entu.user, created: { at: createdDt, by: entu.user } })
    properties.push({ entity: entityId, type: '_created', reference: entu.user, datetime: createdDt, created: { at: createdDt, by: entu.user } })
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
      by: entu.user
    }

    const insertedProperty = await entu.db.collection('property').insertOne(property)
    const newProperty = { _id: insertedProperty.insertedId, ...property }

    delete newProperty.entity
    delete newProperty.created

    if (property.filename && property.filesize && property.filetype) {
      const contentDisposition = `inline;filename="${encodeURI(property.filename.replace('"', '\"'))}"`

      newProperty.upload = {
        url: await getSignedUploadUrl(`${user.account}/${newProperty._id}`, property.filename, property.filetype, contentDisposition),
        method: 'PUT',
        headers: {
          ACL: 'private',
          'Content-Disposition': contentDisposition,
          'Content-Type': property.filetype
        }
      }

      await entu.db.collection('property').updateOne({
        _id: newProperty._id
      }, {
        $set: {
          s3: `${user.account}/${newProperty._id}`
        }
      })
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
          by: entu.user
        }
      }
    })
  }

  return { _id: entityId, properties: pIds }
}

export async function addEntityAggregateSqs (entityId) {
  console.log('addEntityAggregateSqs', entityId)
}

export async function getSignedDownloadUrl (entityId) {
  console.log('getSignedDownloadUrl', entityId)
}

export async function getSignedUploadUrl (entityId) {
  console.log('getSignedDownloadUrl', entityId)
}
