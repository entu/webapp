import stripe from 'stripe'

defineRouteMeta({
  openAPI: {
    tags: ['Account'],
    description: 'Get account billing information',
    parameters: [
      {
        name: 'account',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          description: 'Account ID'
        }
      },
      {
        name: 'locale',
        in: 'query',
        schema: {
          type: 'string',
          description: 'Locale for billing portal'
        }
      }
    ],
    responses: {
      200: {
        description: 'Billing portal URL',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'Stripe billing portal URL' }
              }
            }
          }
        }
      },
      403: {
        description: 'No user authenticated'
      },
      404: {
        description: 'Database not found'
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
