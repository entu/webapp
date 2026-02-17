import stripe from 'stripe'

defineRouteMeta({
  openAPI: {
    tags: ['Database'],
    description: 'Generate Stripe customer portal session URL for managing subscriptions (upgrade/downgrade/cancel), updating payment methods, viewing invoices, and downloading receipts. URL is time-limited and redirects back to Entu after completion. Requires database to have Stripe customer ID configured',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'db',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          description: 'Database name'
        }
      },
      {
        name: 'locale',
        in: 'query',
        schema: {
          type: 'string',
          description: 'Locale for billing portal (e.g., en, et)',
          example: 'en'
        }
      }
    ],
    responses: {
      200: {
        description: 'Billing portal URL for Stripe customer portal',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                billingUrl: {
                  type: 'string',
                  description: 'Stripe billing portal URL',
                  example: 'https://billing.stripe.com/p/session/...'
                }
              }
            }
          }
        }
      },
      401: {
        description: 'Unauthorized - Invalid or missing JWT token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 401 },
                statusMessage: { type: 'string', example: 'Unauthorized' }
              }
            }
          }
        }
      },
      403: {
        description: 'Forbidden - No user authenticated or insufficient permissions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 403 },
                statusMessage: { type: 'string', example: 'Forbidden' }
              }
            }
          }
        }
      },
      404: {
        description: 'Account not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' },
                statusCode: { type: 'integer', example: 404 },
                statusMessage: { type: 'string', example: 'Not Found' }
              }
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const entu = event.context.entu

  if (!entu.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No user'
    })
  }

  const { locale } = getQuery(event)
  const { stripeKey, public: { apiUrl } } = useRuntimeConfig()

  const database = await entu.db.collection('entity').findOne({
    'private._type.string': 'database',
    'private._editor.reference': entu.user
  }, { projection: { _id: true, 'private.billing_customer_id.string': true } })

  const customerId = database?.private?.billing_customer_id?.at(0)?.string

  if (!customerId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Database not found'
    })
  }

  const { billingPortal } = stripe(stripeKey)

  const { url } = await billingPortal.sessions.create({
    customer: customerId,
    locale,
    return_url: apiUrl.replace('/api', `/${entu.account}`)
  })

  return { billingUrl: url }
})
