// Addable child types for an entity: types listing it in add_from, else types listing its type.
export function getAddChildOptions (addFromEntities, entityId, typeId, typeName) {
  let result = addFromEntities?.filter((x) => !['entity', 'menu'].includes(typeName) && x.addFrom.includes(entityId)) || []

  if (result.length === 0) {
    result = addFromEntities?.filter((x) => x.addFrom.includes(typeId)) || []
  }

  return [...result].sort((a, b) => a.label.localeCompare(b.label))
}

// In dark mode the entity color is dimmed 45% toward the dark page color (slate-950).
const DARK_PAGE = '2 6 24'
const DARK_DIM = 45

// Sets the open entity's header color and gradient, the single source for the header and the toolbars: its cover color from the thumbnail API when known, else its id color.
export function useEntityGradient (entityId, coverColor) {
  const { headerColor, headerGradient, headerTint } = useEntity()
  const isDark = usePreferredDark()

  watch(() => [toValue(entityId), toValue(coverColor), isDark.value], ([id, color, dark]) => {
    const cover = color || getCoverColor(id)
    const gradient = cover ? coverGradient(cover) : derivedGradient(id)

    headerColor.value = cover || derivedColor(id)

    // The band gets the dimming as a translucent layer, so the header doesn't glare in dark mode.
    const dimLayer = `rgb(${DARK_PAGE} / ${DARK_DIM}%)`

    headerGradient.value = dark ? `linear-gradient(${dimLayer}, ${dimLayer}), ${gradient}` : gradient

    // One even color for behind the glass menu and list, dimmed by the same amount, so both panes show the same tint wherever they sit.
    headerTint.value = dark ? `color-mix(in srgb, ${headerColor.value} ${100 - DARK_DIM}%, rgb(${DARK_PAGE}))` : headerColor.value
  }, { immediate: true })
}

export function useEntity () {
  const { userId } = useUser()

  const rawEntity = useState('entity.raw', () => null)

  // The open entity's header gradient, its solid color (empty cover) and the even tint behind the glass menu and list, shared with the layout.
  const headerGradient = useState('entity.headerGradient', () => null)
  const headerColor = useState('entity.headerColor', () => null)
  const headerTint = useState('entity.headerTint', () => null)

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
    headerTint,
    rawEntity,
    right,
    typeId,
    typeName
  }
}
