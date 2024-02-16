export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/')) return

  event.context.entu.db = await connectDb(event.context.entu.account)
})
