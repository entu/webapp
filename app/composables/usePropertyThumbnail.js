// Lazily resolves a file property's thumbnail to a signed URL via the thumbnail
// endpoint. Unlike `useEntityThumbnail`, this does NOT fetch on mount — filenames
// appear in tables with many rows, so the request is deferred until `load()` is
// called (e.g. on first hover). `load()` fetches once and caches the result;
// subsequent calls are no-ops. `propertyId` and `size` may be refs, getters, or
// plain values.
export function usePropertyThumbnail (propertyId, size = 200) {
  const url = ref()

  let loaded = false
  let requestId = 0

  // Reset when the property changes so a reused instance doesn't keep showing
  // the previous property's thumbnail (load-on-demand is re-armed per id).
  watch(() => toValue(propertyId), () => {
    loaded = false
    url.value = undefined
  })

  async function load () {
    if (loaded) return

    const id = toValue(propertyId)
    if (!id) return

    loaded = true
    const currentRequest = ++requestId

    try {
      const result = await apiGetPropertyThumbnail(id, toValue(size))

      if (currentRequest !== requestId) return

      url.value = result?.url
    }
    catch {
      if (currentRequest !== requestId) return

      url.value = undefined
    }
  }

  return { url, load }
}
