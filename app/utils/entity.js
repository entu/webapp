// Addable child types for an entity: types listing it in add_from, else types listing its type.
export function getAddChildOptions (addFromEntities, entityId, typeId, typeName) {
  let result = addFromEntities?.filter((x) => !['entity', 'menu'].includes(typeName) && x.addFrom.includes(entityId)) || []

  if (result.length === 0) {
    result = addFromEntities?.filter((x) => x.addFrom.includes(typeId)) || []
  }

  return [...result].sort((a, b) => a.label.localeCompare(b.label))
}

// Sets the open entity's header color and gradient, the single source for the header and the toolbars: its cover color from the thumbnail API when known, else its id color.
export function useEntityGradient (entityId, coverColor) {
  const { headerColor, headerGradient } = useEntity()

  watch(() => [toValue(entityId), toValue(coverColor)], ([id, color]) => {
    const cover = color || getCoverColor(id)

    headerColor.value = cover || derivedColor(id)
    headerGradient.value = cover ? coverGradient(cover) : derivedGradient(id)
  }, { immediate: true })
}

export function useEntity () {
  const { userId } = useUser()

  const rawEntity = useState('entity.raw', () => null)

  // The open entity's header gradient and solid color, shared so the layout can paint the gradient behind the toolbar.
  const headerGradient = useState('entity.headerGradient', () => null)
  const headerColor = useState('entity.headerColor', () => null)

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
    headerColor,
    headerGradient,
    rawEntity,
    right,
    typeId,
    typeName
  }
}
