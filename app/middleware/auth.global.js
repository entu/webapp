export default defineNuxtRouteMiddleware(({ path: toPath }, { path, query }) => {
  if (!['/auth/passkey', '/auth/apple', '/auth/google', '/auth/e-mail', '/auth/smart-id', '/auth/mobile-id', '/auth/id-card'].includes(toPath)) return

  const nextPage = useLocalStorage('next', {})

  nextPage.value = { path, query }
})
