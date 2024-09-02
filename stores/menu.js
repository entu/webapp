export const useMenueStore = defineStore('menu', () => {
  const route = useRoute()
  const { accountId } = useAccount()

  const activeMenu = ref({})
  const menuResult = ref({})
  const addFromResult = ref({})

  const menuEntities = computed(() => menuResult.value?.entities || [])

  const addFromEntities = computed(() => addFromResult.value?.entities?.map(x => ({
    value: x._id,
    label: getValue(x.label) || getValue(x.name),
    addFrom: x.add_from?.map(x => x.reference)
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
        'query.string'
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

    menuResult.value.entities?.forEach((entity) => {
      entity.addFrom = addFromEntities.value?.filter(x => x.addFrom?.includes(entity._id))
    })
  }

  watch(accountId, get, { immediate: true })

  watch([() => route.query, menuResult], () => {
    const query = window.location.search.substring(1)

    activeMenu.value = query ? menuEntities.value?.find(x => window.location.search.substring(1).startsWith(getValue(x.query))) : undefined
  }, { immediate: true })

  return {
    menuEntities,
    activeMenu,
    addFromEntities,
    get
  }
})
