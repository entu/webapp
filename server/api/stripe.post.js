import stripe from 'stripe'

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
