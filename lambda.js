'use strict'

const aws = require('aws-sdk')
const s3 = new aws.S3()

exports.handler = async (event) => {
  // console.log('Received event:', JSON.stringify(event, null, 2))

  const bucket = event.Records[0].s3.bucket.name
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))

  await s3.copyObject({
    ACL: 'public-read',
    Bucket: bucket,
    CopySource: `${bucket}/${key}`,
    Key: key.replace('build/', 'public/')
  }).prototype()
}
