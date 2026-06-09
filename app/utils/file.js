// Uploads a file blob to a pre-signed destination using XMLHttpRequest so that
// upload progress can be reported. `uploadSpec` is the `{ method, url, headers }`
// descriptor returned by the API for a file property.
export function uploadBlob (file, uploadSpec, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open(uploadSpec.method, uploadSpec.url)

    for (const header in uploadSpec.headers) {
      if (header.toLowerCase() === 'content-length') continue

      request.setRequestHeader(header, uploadSpec.headers[header])
    }

    request.upload.addEventListener('progress', (e) => {
      const percent = (e.loaded / e.total) * 100
      onProgress?.({ percent })
    })

    request.addEventListener('load', () => {
      if (request.status === 200) {
        resolve()
      }
      else {
        reject(new Error(`Upload failed with status ${request.status}`))
      }
    })

    request.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    request.send(file)
  })
}
