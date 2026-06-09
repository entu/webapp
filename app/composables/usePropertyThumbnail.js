// Lazily resolves a file property's thumbnail to a signed URL via the thumbnail
// endpoint. Unlike `useEntityThumbnail`, this does NOT fetch on mount — filenames
// appear in tables with many rows, so the request is deferred until `load()` is
// called (e.g. on first hover). `load()` fetches once and caches the result;
// subsequent calls are no-ops. `propertyId` and `size` may be refs, getters, or
// plain values.
export function usePropertyThumbnail (propertyId, size = 200) {
  const url = ref()

  let loaded = false

  async function load () {
    if (loaded) return

    const id = toValue(propertyId)
    if (!id) return

    loaded = true

    try {
      const result = await apiGetPropertyThumbnail(id, toValue(size))
      url.value = result?.url
    }
    catch {
      url.value = undefined
    }
  }

  return { url, load }
}
