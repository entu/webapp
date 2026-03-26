import { createYoga } from 'graphql-yoga'

export default defineEventHandler(async (event) => {
  let entu
  try {
    entu = await buildEntuContext(event)
  }
  catch (e) {
    setResponseStatus(event, e.statusCode || 500)
    setResponseHeader(event, 'content-type', 'application/json')
    return send(event, JSON.stringify({
      errors: [{ message: e.statusMessage || e.message }]
    }))
  }

  const schema = await getOrBuildSchema(entu)

  const yoga = createYoga({
    schema,
    context: { entu },
    graphqlEndpoint: `/graphql/${entu.account}`
  })

  const method = getMethod(event)
  const headers = getHeaders(event)
  const host = headers.host || 'localhost'
  const proto = (headers['x-forwarded-proto'] || 'http').split(',')[0].trim()
  const rawPath = event.node.req.url || event.path
  const url = `${proto}://${host}${rawPath}`

  const body = await readRawBody(event)

  const request = new Request(url, {
    method,
    headers: new Headers(headers),
    body: body ?? undefined
  })

  const response = await yoga.fetch(request)

  setResponseStatus(event, response.status)
  for (const [k, v] of response.headers.entries()) {
    setResponseHeader(event, k, v)
  }

  return send(event, await response.text())
})
