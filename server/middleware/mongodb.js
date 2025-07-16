export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return
  if (event.path.startsWith('/api/stripe')) return
  if (event.path.startsWith('/api/openapi')) return

  event.context.entu.db = await connectDb(event.context.entu.account)
})
