// Addable child types for an entity: types listing it in add_from, else types listing its type.
export function getAddChildOptions (addFromEntities, entityId, typeId, typeName) {
  let result = addFromEntities?.filter((x) => !['entity', 'menu'].includes(typeName) && x.addFrom.includes(entityId)) || []

  if (result.length === 0) {
    result = addFromEntities?.filter((x) => x.addFrom.includes(typeId)) || []
  }

  return [...result].sort((a, b) => a.label.localeCompare(b.label))
}

// Sets the open entity's header gradient, the single source for the header band and the toolbars: its id color at once, then its cover color once derived.
export function useEntityGradient (entityId, thumbnailUrl) {
  const { headerGradient } = useEntity()

  watch(() => [toValue(entityId), toValue(thumbnailUrl)], async ([id, url]) => {
    const cached = getCachedCoverColor(id)

    headerGradient.value = cached ? coverGradient(cached) : derivedGradient(id)

    if (cached || !url) return

    const rgb = await getCoverColor(id, url)

    if (!rgb || id !== toValue(entityId)) return

    headerGradient.value = coverGradient(rgb)
  }, { immediate: true })
}

export function useEntity () {
  const { userId } = useUser()

  const rawEntity = useState('entity.raw', () => null)

  // The open entity's header gradient, shared so the layout can paint it behind the toolbar.
  const headerGradient = useState('entity.headerGradient', () => null)

  const entityId = computed(() => rawEntity.value?._id)
  const typeId = computed(() => getValue(rawEntity.value?._type, 'reference'))
  const typeName = computed(() => getValue(rawEntity.value?._type, 'string'))

  const right = computed(() => ({
    owner: rawEntity.value?._owner?.some((x) => x.reference === userId.value) || false,
    editor: rawEntity.value?._editor?.some((x) => x.reference === userId.value) || false,
    expander: rawEntity.value?._expander?.some((x) => x.reference === userId.value) || false,
    viewer: rawEntity.value?._viewer?.some((x) => x.reference === userId.value) || false
  }))

  return {
    entityId,
    headerGradient,
    rawEntity,
    right,
    typeId,
    typeName
  }
}
