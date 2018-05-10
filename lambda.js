'use strict'

const aws = require('aws-sdk')
const s3 = new aws.S3()

const mimeTypes = {
  'css': 'text/css',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'js': 'application/javascript',
  'png': 'image/png',
  'txt': 'text/plain'
}

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
  const type = mimeTypes[key.split('.').pop()]
  const cache = key.endsWith('index.html') ? 'no-cache' : 'max-age=604800, must-revalidate'

  await s3.copyObject({
    ACL: 'public-read',
    Bucket: bucket,
    CopySource: `${bucket}/${key}`,
    Key: key.replace('build/', 'public/'),
    ContentType: type,
    CacheControl: cache,
    MetadataDirective: 'REPLACE'
  }).promise()

  console.log('Key: ' + key + ' Type: ' + type)
}
