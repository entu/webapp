import { createYoga } from 'graphql-yoga'

const SANDBOX_HTML = (endpoint) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Apollo Sandbox</title>
  <style>* { margin: 0; padding: 0; } html, body { height: 100%; }</style>
</head>
<body>
  <div id="sandbox" style="height:100vh;"></div>
  <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script>
  <script>
    new window.EmbeddedSandbox({
      target: '#sandbox',
      initialEndpoint: '${endpoint}',
      endpointIsEditable: false
    });
  </script>
</body>
</html>`

export default defineEventHandler(async (event) => {
  // Serve Apollo Sandbox for browser requests
  if (getRequestHeader(event, 'accept')?.includes('text/html')) {
    const headers = getHeaders(event)
    const host = headers.host || 'localhost'
    const proto = (headers['x-forwarded-proto'] || 'http').split(',')[0].trim()
    const account = formatDatabaseName(event.context.params?.db)

    setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
    return send(event, SANDBOX_HTML(`${proto}://${host}/graphql/${account}`))
  }

  // Handle GraphQL GET requests (introspection etc.)
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
    graphqlEndpoint: `/graphql/${entu.account}`,
    graphiql: false
  })

  const method = getMethod(event)
  const headers = getHeaders(event)
  const host = headers.host || 'localhost'
  const proto = (headers['x-forwarded-proto'] || 'http').split(',')[0].trim()
  const rawPath = event.node.req.url || event.path
  const url = `${proto}://${host}${rawPath}`

  const request = new Request(url, {
    method,
    headers: new Headers(headers)
  })

  const response = await yoga.fetch(request)

  setResponseStatus(event, response.status)
  for (const [k, v] of response.headers.entries()) {
    setResponseHeader(event, k, v)
  }

  return send(event, await response.text())
})
