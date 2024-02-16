// Return public or private properties (based user rights)
export async function claenupEntity (entity, user, _thumbnail) {
  if (!entity) return

  let result = { _id: entity._id }

  if (user && entity.access.includes(user)) {
    result = { ...result, ...entity.private }
  } else if (entity.access.includes('public')) {
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

export async function addEntityAggregateSqs (entityId) {
  console.log('addEntityAggregateSqs', entityId)
}

export async function getSignedDownloadUrl (entityId) {
  console.log('getSignedDownloadUrl', entityId)
}

export async function getSignedUploadUrl (entityId) {
  console.log('getSignedDownloadUrl', entityId)
}
