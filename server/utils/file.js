import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function getSignedDownloadUrl (account, entityId, property) {
  const { s3region, s3Endpoint, s3Bucket, s3Key, s3Secret } = useRuntimeConfig()

  const s3 = new S3Client({
    region: s3region,
    endpoint: s3Endpoint,
    credentials: {
      accessKeyId: s3Key,
      secretAccessKey: s3Secret
    }
  })

  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: getKey(account, entityId, property)
  })

  return await getSignedUrl(s3, command, { expiresIn: 60 })
}

export async function getSignedUploadUrl (account, entityId, property, contentDisposition, contentType) {
  const { s3region, s3Endpoint, s3Bucket, s3Key, s3Secret } = useRuntimeConfig()

  const s3 = new S3Client({
    region: s3region,
    endpoint: s3Endpoint,
    credentials: {
      accessKeyId: s3Key,
      secretAccessKey: s3Secret
    }
  })

  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: getKey(account, entityId, property),
    ACL: 'private',
    ContentDisposition: contentDisposition,
    ContentType: contentType
  })

  return await getSignedUrl(s3, command, { expiresIn: 60 })
}

function getKey (account, entityId, property) {
  return `${account}/${entityId}/${property._id}`
}
