export default defineEventHandler(async () => {
  // Get the original OpenAPI spec from the default route
  const openapi = await $fetch('/api/docs/openapi.json')

  // Filter out paths that include /_
  if (openapi.paths) {
    const filteredPaths = Object.fromEntries(
      Object.entries(openapi.paths).filter(([path]) => !path.includes('/_') && path.startsWith('/api/') && path !== '/api/openapi' && path !== '/api/stripe')
    )
    openapi.paths = filteredPaths
  }

  // Add additional OpenAPI metadata that Nitro config doesn't support
  openapi.servers = [
    {
      url: 'https://entu.app'
    }
  ]

  if (!openapi.components) {
    openapi.components = {}
  }

  openapi.components.securitySchemes = {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token obtained from /api/auth endpoint'
    }
  }

  return openapi
})
