// Resolves an entity's thumbnail to a signed URL via the thumbnail endpoint.
// `entityId` and `size` may be refs, getters, or plain values; pass an empty
// `entityId` (e.g. when the entity has no photo) to skip the request.
export function useEntityThumbnail (entityId, size = 200) {
  const url = ref()

  // Tracks the latest request so a slow response for a previous entity can't
  // overwrite the url after the watched id has already changed.
  let requestId = 0

  watch(() => toValue(entityId), async (id) => {
    // Bump on every change (even an empty id) so any in-flight request for a
    // previous entity is invalidated and can't write a stale url after the
    // watched id has moved on (e.g. switching to an entity without a photo).
    const currentRequest = ++requestId

    url.value = undefined

    if (!id) return

    try {
      const result = await apiGetEntityThumbnail(id, toValue(size))

      if (currentRequest !== requestId) return

      url.value = result?.url
    }
    catch {
      if (currentRequest !== requestId) return

      url.value = undefined
    }
  }, { immediate: true })

  return { url }
}
