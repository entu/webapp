import stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const { locale } = getQuery(event)

  const { stripeKey, public: { apiUrl } } = useRuntimeConfig()

  const database = await entu.db.collection('entity').findOne({
    'private._type.string': 'database'
  }, { projection: { _id: true, 'private.billing_customer.string': true } })

  const customerId = database?.private?.billing_customer?.at(0)?.string

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

  sendRedirect(event, url)
})
