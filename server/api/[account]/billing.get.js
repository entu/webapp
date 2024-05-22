import stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const entu = event.context.entu
  const { locale } = getQuery(event)

  const { stripeKey, public: { apiUrl } } = useRuntimeConfig()

  const database = await entu.db.collection('entity').findOne({
    'private._type.string': 'database',
    'private._editors.reference': entu.user
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

  sendRedirect(event, url)
})
