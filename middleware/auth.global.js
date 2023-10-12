export default defineNuxtRouteMiddleware(({ path: toPath }, { path, query }) => {
  if (!['/auth/apple', '/auth/google', '/auth/mobile-id', '/auth/smart-id', '/auth/id-card'].includes(toPath)) return

  const nextPage = useLocalStorage('next', {})

  nextPage.value = { path, query }
})
