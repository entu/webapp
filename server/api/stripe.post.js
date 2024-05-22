export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (body.type === 'checkout.session.completed') {
    const { customer, reference } = body.data?.object

    if (!customer) {
      console.error('No customer found in checkout')

      return
    }

    if (!reference) {
      console.error('No reference found in checkout')

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
      { type: 'billing_customer', string: customer }
    ])
  }

  console.error('Unhandled Stripe event:', body.type)
})
