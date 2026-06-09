// Shared entity-list fetching, infinite scroll, keyboard navigation and
// query-driven reset used by the list and table entity views. The consumer
// provides the scroll container template ref; behaviour is tuned via options:
//   - fetchProps:   extra `props` requested from the API (default: none)
//   - mapEntity:    transform applied to each fetched entity (default: identity)
//   - onQueryChange: hook called with the new route query before the list resets
const ROW_HEIGHT = 48

export function useEntities (listElement, options = {}) {
  const {
    fetchProps,
    mapEntity = (entity) => entity,
    onQueryChange
  } = options

  const route = useRoute()
  const { accountId } = useAccount()

  const entitiesList = ref([])
  const entitiesCount = ref(null)
  const limit = ref(Math.ceil(window.innerHeight / ROW_HEIGHT) + 3)
  const skip = ref(0)
  const isLoading = ref(false)
  const isLoadingOnScroll = ref(false)
  const locationSearch = ref(null)
  const scrollIdx = ref(0)

  // Tracks the latest fetch so a slow response (e.g. an in-flight scroll fetch)
  // can't append rows after the query changed and the list was reset.
  let requestId = 0

  const { y: listElementScroll } = useScroll(listElement)

  const debouncedScroll = useDebounceFn(async () => {
    await navigateTo({ path: `/${accountId.value}/${entitiesList.value.at(scrollIdx.value)._id}`, query: route.query })
  }, 300)

  const isQuery = computed(() => Object.keys(route.query).length > 0)

  useInfiniteScroll(listElement, async () => {
    if (isLoading.value) return
    if (limit.value === 0) return
    if (entitiesCount.value === 0) return

    isLoadingOnScroll.value = true
    await getEntities()
    isLoadingOnScroll.value = false
  }, { distance: 150 })

  onKeyStroke(['ArrowDown', 'ArrowUp'], (e) => {
    if (route.hash) return

    if (e.code === 'ArrowDown' && scrollIdx.value < entitiesList.value.length - 1) {
      scrollIdx.value++
    }
    if (e.code === 'ArrowUp' && scrollIdx.value > 0) {
      scrollIdx.value--
    }

    listElementScroll.value = scrollIdx.value * ROW_HEIGHT - 148

    debouncedScroll()
  })

  watch(() => route.query, (value) => {
    const newSearch = new URLSearchParams(value).toString()
    if (locationSearch.value === newSearch) return

    onQueryChange?.(value)

    // Invalidate any in-flight fetch so its response can't append to the reset list.
    requestId++

    skip.value = 0
    entitiesCount.value = null
    entitiesList.value = []
    locationSearch.value = newSearch

    getEntities(true)
  }, { deep: true, immediate: true })

  watch(() => route.params.entityId, (value) => {
    scrollIdx.value = entitiesList.value.findIndex((x) => x._id === value) || 0
  }, { immediate: true })

  async function getEntities () {
    if (entitiesCount.value > 0 && entitiesCount.value <= skip.value) return

    if (!isQuery.value) {
      skip.value = 0
      entitiesList.value = []
      return
    }

    isLoading.value = true

    const currentRequest = ++requestId

    const params = {
      ...route.query,
      limit: limit.value,
      skip: skip.value
    }

    if (fetchProps) {
      params.props = fetchProps
    }

    const { entities, count } = await apiGetEntities(params)

    if (currentRequest !== requestId) return

    entitiesList.value = [...entitiesList.value, ...entities.map(mapEntity)]
    entitiesCount.value = count
    skip.value += limit.value

    scrollIdx.value = entitiesList.value.findIndex((x) => x._id === route.params.entityId) || 0

    isLoading.value = false
  }

  return {
    entitiesList,
    entitiesCount,
    limit,
    skip,
    isLoading,
    isLoadingOnScroll,
    scrollIdx,
    getEntities
  }
}
