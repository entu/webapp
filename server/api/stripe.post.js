import stripe from 'stripe'

defineRouteMeta({
  openAPI: {
    tags: ['Payment'],
    description: 'Handle Stripe webhook events for payment processing',
    security: [], // No authentication required for webhooks
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            description: 'Stripe webhook payload',
            properties: {
              id: { type: 'string', description: 'Event ID' },
              object: { type: 'string', example: 'event' },
              type: { type: 'string', description: 'Event type', example: 'checkout.session.completed' },
              data: {
                type: 'object',
                description: 'Event data',
                properties: {
                  object: {
                    type: 'object',
                    description: 'The object that triggered the event'
                  }
                }
              }
            }
          }
        }
      }
    },
    parameters: [
      {
        name: 'stripe-signature',
        in: 'header',
        required: true,
        schema: {
          type: 'string',
          description: 'Stripe webhook signature for verification'
        }
      }
    ],
    responses: {
      200: {
        description: 'Webhook processed successfully'
      },
      400: {
        description: 'Invalid webhook signature or payload',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const { stripeKey, stripeEndpointSecret } = useRuntimeConfig()

  const stripeSignature = getHeader(event, 'stripe-signature')
  const body = await readRawBody(event, false)

  const { webhooks } = stripe(stripeKey)

  const stripeEvent = webhooks.constructEvent(body, stripeSignature, stripeEndpointSecret)

  if (stripeEvent.type === 'checkout.session.completed') {
    const { customer, client_reference_id: reference } = stripeEvent.data?.object

    if (!customer) {
      loggerError('No customer found in checkout')

      return
    }

    if (!reference) {
      loggerError('No reference found in checkout')

      return
    }

    const [db, user] = reference.split('-')

    const entu = {
      account: db,
      db: await connectDb(db),
      systemUser: true
    }

    const { _id: databaseId } = await entu.db.collection('entity').findOne({
      'private._type.string': 'database'
    }, { projection: { _id: true } })

    await setEntity(entu, databaseId, [
      { type: 'billing_customer_id', string: customer }
    ])
  }
  else {
    loggerError(`Unhandled Stripe event "${stripeEvent.type}"`)
  }
})
