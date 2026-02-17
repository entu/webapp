import { generateAuthenticationOptions } from '@simplewebauthn/server'

defineRouteMeta({
  openAPI: {
    tags: ['Authentication'],
    description: 'Generate WebAuthn authentication options for passkey login',
    security: [], // No authentication required for login
    responses: {
      200: {
        description: 'WebAuthn authentication options',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                challenge: { type: 'string', description: 'Base64URL encoded challenge' },
                rpId: { type: 'string', description: 'Relying party ID' },
                allowCredentials: {
                  type: 'array',
                  description: 'Empty array for discoverable credentials',
                  items: { type: 'object' }
                },
                userVerification: { type: 'string', example: 'preferred' }
              }
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const { hostname } = getRequestURL(event)

  const options = await generateAuthenticationOptions({
    rpID: hostname,
    userVerification: 'preferred',
    allowCredentials: []
  })

  return options
})
