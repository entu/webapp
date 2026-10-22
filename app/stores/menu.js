export const useMenuStore = defineStore('menu', () => {
  const route = useRoute()
  const { accountId } = useAccount()

  const activeMenu = ref({})
  const menuResult = ref({})
  const addFromResult = ref({})

  const menuEntities = computed(() => menuResult.value?.entities || [])

  const addFromEntities = computed(() => addFromResult.value?.entities?.map((x) => ({
    value: x._id,
    label: getValue(x.label) || getValue(x.name),
    addFrom: x.add_from?.map((x) => x.reference)
  })) || [])

  async function get () {
    if (!accountId.value) {
      menuResult.value = {}
      addFromResult.value = {}

      return
    }

    menuResult.value = await apiGetEntities({
      '_type.string': 'menu',
      props: [
        'ordinal.number',
        'group',
        'name',
        'query.string',
        'add_entity.reference',
        'add_parent.reference'
      ].join(',')
    })

    addFromResult.value = await apiGetEntities({
      '_type.string': 'entity',
      'add_from._id.exists': true,
      props: [
        'name',
        'label',
        'add_from.reference'
      ].join(',')
    })

    const typeLabels = await getTypeLabels(menuEntities.value)

    for (const entity of menuEntities.value) {
      entity.addEntities = getUniqueReferences(entity.add_entity)
        .filter((x) => typeLabels[x])
        .map((x) => ({ value: x, label: typeLabels[x] }))
        .sort((a, b) => a.label.localeCompare(b.label))

      entity.addParents = getUniqueReferences(entity.add_parent)
    }
  }

  // Labels for every menu's add_entity types, reusing add_from types and fetching the rest by id.
  async function getTypeLabels (menus) {
    const labels = Object.fromEntries(addFromEntities.value.map((x) => [x.value, x.label]))
    const missingIds = [...new Set(menus?.flatMap((x) => getUniqueReferences(x.add_entity)) ?? [])].filter((x) => !labels[x])

    const types = await Promise.all(missingIds.map((x) => apiGetEntity(x, ['name', 'label']).catch(() => {})))

    for (const type of types) {
      if (!type?._id) continue

      labels[type._id] = getValue(type.label) || getValue(type.name)
    }

    return labels
  }

  watch(accountId, get, { immediate: true })

  watch([() => route.query, menuResult], () => {
    const query = new URLSearchParams(route.query).toString()

    activeMenu.value = query ? menuEntities.value?.find((x) => query.startsWith(new URLSearchParams(getValue(x.query)).toString())) : undefined
  }, { immediate: true })

  return {
    menuEntities,
    activeMenu,
    addFromEntities,
    get
  }
})

// Distinct reference ids of a reference property's values.
function getUniqueReferences (values) {
  return [...new Set(values?.map((x) => x.reference).filter(Boolean) ?? [])]
}
