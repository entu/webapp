// Resolves an entity's thumbnail to a signed URL via the thumbnail endpoint.
// `entityId` and `size` may be refs, getters, or plain values; pass an empty
// `entityId` (e.g. when the entity has no photo) to skip the request.
export function useEntityThumbnail (entityId, size = 200) {
  const url = ref()

  watch(() => toValue(entityId), async (id) => {
    url.value = undefined

    if (!id) return

    try {
      const result = await apiGetEntityThumbnail(id, toValue(size))
      url.value = result?.url
    }
    catch {
      url.value = undefined
    }
  }, { immediate: true })

  return { url }
}
