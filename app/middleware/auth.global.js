export default defineNuxtRouteMiddleware(({ path: toPath }, { path, query }) => {
  if (!authProviderRoutes().includes(toPath)) return

  const nextPage = useLocalStorage('next', {})

  nextPage.value = { path, query }
})
