'use strict'

console.log('Loading function')

const aws = require('aws-sdk')
const s3 = new aws.S3()



exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2))

    const bucket = event.Records[0].s3.bucket.name
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
    const params = {
        ACL: 'public-read',
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: key.replace('build/', 'public/')
    }

    s3.copyObject(params, (err, data) => {
        if (err) {
            console.log(err)
            callback(err)
        } else {
            callback(null, key)
        }
    })
}
