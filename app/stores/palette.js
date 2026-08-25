const MAX_RECENTS = 10

export const usePaletteStore = defineStore('palette', () => {
  const { accountId } = useAccount()
  const { rawEntity } = useEntity()

  const isOpen = ref(false)
  const query = ref('')
  const queryState = ref(paletteEmptyState())
  const modalDepth = ref(0)
  const recents = ref([])
  const typeOptions = shallowRef([])
  const showSearchModal = ref(false)

  const storedRecents = useLocalStorage('palette-recents', {})

  // Cache context (locale + account) for type options and property definitions.
  let typeOptionsContext = null
  let typeOptionsPromise = null
  let propertyCache = {}

  function open () {
    if (modalDepth.value > 0) return

    query.value = ''
    queryState.value = paletteEmptyState()
    recents.value = storedRecents.value[accountId.value] || []
    isOpen.value = true

    loadTypeOptions()
  }

  function close () {
    isOpen.value = false
  }

  function toggle () {
    if (isOpen.value) {
      close()
    }
    else {
      open()
    }
  }

  function modalOpened () {
    modalDepth.value++
  }

  function modalClosed () {
    modalDepth.value = Math.max(0, modalDepth.value - 1)
  }

  async function loadTypeOptions () {
    const context = `${localStorage.getItem('locale')}:${accountId.value}`

    if (typeOptionsContext !== context) {
      typeOptions.value = []
      typeOptionsPromise = null
      propertyCache = {}
      typeOptionsContext = context
    }

    if (typeOptions.value.length > 0) return
    if (typeOptionsPromise) return typeOptionsPromise

    typeOptionsPromise = fetchTypeOptions().finally(() => {
      typeOptionsPromise = null
    })

    return typeOptionsPromise
  }

  async function fetchTypeOptions () {
    try {
      const { entities } = await apiGetEntities({
        '_type.string': 'entity',
        props: 'name,label',
        limit: 1000
      })

      typeOptions.value = (entities || []).map((x) => {
        const typeName = getValue(x.name)
        const label = getValue(x.label) || typeName

        return {
          typeId: x._id,
          typeName,
          label,
          foldedLabel: paletteFold(label),
          foldedName: paletteFold(typeName)
        }
      }).filter((x) => x.typeName)
    }
    catch {
      typeOptions.value = []
    }
  }

  async function getProperties (typeId) {
    if (!typeId) return []
    if (propertyCache[typeId]) return propertyCache[typeId]

    try {
      const { entities } = await apiGetEntities({
        '_parent.reference': typeId,
        props: 'hidden,label,name,type',
        limit: 1000
      })

      propertyCache[typeId] = (entities || []).map((x) => {
        const name = getValue(x.name)
        const label = getValue(x.label) || name

        return {
          name,
          type: getValue(x.type),
          label,
          hidden: getValue(x.hidden, 'boolean'),
          foldedLabel: paletteFold(label),
          foldedName: paletteFold(name)
        }
      }).filter((x) => x.name && !x.hidden)
    }
    catch {
      return []
    }

    return propertyCache[typeId]
  }

  // Record every viewed entity into the per-account recents, newest first.
  watch(rawEntity, (entity) => {
    if (!entity?._id || !accountId.value) return

    const record = {
      _id: entity._id,
      name: getValue(entity.name) || entity._id,
      typeLabel: getValue(entity._type),
      hasPhoto: !!entity.photo?.length
    }

    const list = (storedRecents.value[accountId.value] || []).filter((x) => x._id !== record._id)

    storedRecents.value = { ...storedRecents.value, [accountId.value]: [record, ...list].slice(0, MAX_RECENTS) }
  })

  watch(accountId, (value, oldValue) => {
    if (value === oldValue) return

    close()
  })

  return {
    isOpen,
    query,
    queryState,
    modalDepth,
    recents,
    typeOptions,
    showSearchModal,
    open,
    close,
    toggle,
    modalOpened,
    modalClosed,
    loadTypeOptions,
    getProperties
  }
})
