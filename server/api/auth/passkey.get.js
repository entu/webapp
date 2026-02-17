import { generateAuthenticationOptions } from '@simplewebauthn/server'

defineRouteMeta({
  openAPI: {
    tags: ['Passkey'],
    description: 'Generate WebAuthn authentication challenge (step 1 of 2 for passkey login). Returns challenge, RP ID, and authentication options for client-side WebAuthn API. Uses discoverable credentials (empty allowCredentials) so any passkey can authenticate. Client must call navigator.credentials.get() with these options',
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
