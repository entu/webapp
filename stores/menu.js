export const useMenueStore = defineStore('menu', () => {
  const menuEntities = ref([])

  async function get () {
    const menuResult = await apiGetEntities({
      '_type.string': 'menu',
      props: [
        'ordinal.number',
        'group',
        'name',
        'query.string'
      ].join(',')
    })

    const addFromResult = await apiGetEntities({
      '_type.string': 'entity',
      'add_from._id.exists': true,
      props: [
        'name',
        'label',
        'add_from.reference'
      ].join(',')
    })

    menuEntities.value = menuResult?.entities?.map(entity => ({
      ...entity,
      addFrom: addFromResult?.entities?.filter(x => x.add_from?.map(x => x.reference).includes(entity._id))
    })) || []
  }

  return {
    menuEntities,
    get
  }
})
