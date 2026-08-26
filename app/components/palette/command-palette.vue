<script setup>
// Ranking bands for the typed token-free list: search > grammar > commands > entity hits.
const SEARCH_BAND = 3000
const GRAMMAR_BAND = 2000
const COMMAND_BAND = 1000

const route = useRoute()
const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })

const { accountId, accounts } = useAccount()
const { logOut, token, userId } = useUser()
const { entityId, rawEntity, right, typeId, typeName } = useEntity()

const menuStore = useMenuStore()
const { activeMenu, addFromEntities, menuEntities } = storeToRefs(menuStore)

const chatStore = useChatStore()

const paletteStore = usePaletteStore()
const { isOpen, query, queryState, recents, typeOptions } = storeToRefs(paletteStore)

const selectedIndex = ref(0)
const entityHits = ref([])
const resultCount = ref(null)
const facets = ref([])
const properties = shallowRef([])

const inputRef = useTemplateRef('inputRef')
const listRef = useTemplateRef('listRef')

// Tracks the latest fetches so slow responses can't overwrite newer state.
let fetchRequestId = 0
let propertiesRequestId = 0

const trimmedQuery = computed(() => query.value.trim())
const foldedQuery = computed(() => paletteFold(trimmedQuery.value))
const stateEmpty = computed(() => paletteStateIsEmpty(queryState.value))
const isEmptyState = computed(() => !query.value && stateEmpty.value)

// MARK: current entity (from the shared useEntity state the entity page populates)

const currentName = computed(() => getValue(rawEntity.value?.name) || rawEntity.value?._id)
const currentTypeLabel = computed(() => typeOptions.value.find((x) => x.typeId === typeId.value)?.label || typeName.value)

const addChildOptions = computed(() => getAddChildOptions(addFromEntities.value, entityId.value, typeId.value, typeName.value))

// MARK: row builders

function withFoldedTitle (row) {
  return { ...row, foldedTitle: paletteFold(row.title) }
}

function actionHash (hash) {
  return () => navigateTo({ path: route.path, query: route.query, hash }, { replace: true })
}

const entityActionRows = computed(() => {
  if (!rawEntity.value || !route.params.entityId) return []

  const rows = []

  if (userId.value && right.value.expander) {
    for (const option of addChildOptions.value) {
      rows.push({
        id: `addChild-${option.value}`,
        icon: 'expand',
        title: t('addOneChild', { name: option.label?.toLowerCase() }),
        run: actionHash(`#child-${option.value}`)
      })
    }
  }

  const actionTable = [
    ['edit', 'edit', 'editor'],
    ['duplicate', 'copy', 'owner'],
    ['parents', 'tree-view', 'editor'],
    ['rights', 'user-multiple', 'owner'],
    ['history', 'history', 'editor']
  ]

  for (const [id, icon, rightKey] of actionTable) {
    if (!right.value[rightKey]) continue

    rows.push({ id, icon, title: t(id), run: actionHash(`#${id}`) })
  }

  rows.push({
    id: 'openInNewTab',
    icon: 'external-link',
    title: t('openInNewTab'),
    run: () => window.open(`/${accountId.value}/${route.params.entityId}`)
  })

  return rows.map(withFoldedTitle)
})

const createRows = computed(() => {
  if (!userId.value) return []

  const options = activeMenu.value?.addFrom || []

  return options.map((option) => withFoldedTitle({
    id: `new-${option.value}`,
    icon: 'add',
    title: t('addOne', { name: option.label?.toLowerCase() }),
    run: actionHash(`#add-${option.value}`)
  }))
})

const navigationRows = computed(() => {
  const rows = []

  for (const entity of menuEntities.value) {
    const queryString = getValue(entity.query)

    rows.push({
      id: `menu-${entity._id}`,
      icon: 'arrow-right',
      title: t('paletteGoTo', { name: getValue(entity.name) }),
      detail: t('paletteNavigate'),
      run: () => {
        if (queryString?.startsWith('http') || queryString?.startsWith('/')) {
          window.open(linkReplace(queryString, accountId.value, locale.value), '_blank', 'noopener')
        }
        else {
          navigateTo({ path: `/${accountId.value}`, query: queryStringToObject(queryString) })
        }
      }
    })
  }

  rows.push({
    id: 'dashboard',
    icon: 'arrow-right',
    title: t('paletteGoDashboard'),
    detail: t('paletteNavigate'),
    run: () => navigateTo({ path: `/${accountId.value}` })
  })

  if (userId.value) {
    rows.push({
      id: 'profile',
      icon: 'arrow-right',
      title: t('paletteMyProfile'),
      detail: t('paletteNavigate'),
      run: () => navigateTo({ path: `/${accountId.value}/${userId.value}`, query: route.query })
    })
  }

  for (const account of accounts.value.filter((x) => x._id !== accountId.value)) {
    rows.push({
      id: `db-${account._id}`,
      icon: 'arrow-right',
      title: t('paletteSwitchDatabase', { name: account.name }),
      detail: t('paletteNavigate'),
      run: () => navigateTo({ path: `/${account._id}` })
    })
  }

  return rows.map(withFoldedTitle)
})

function advancedSearchRow () {
  return {
    id: 'advancedSearch',
    icon: 'search-advanced',
    title: t('advancedSearch'),
    run: () => {
      useAnalytics('show_search')
      paletteStore.showSearchModal = true
    }
  }
}

const appCommandRows = computed(() => {
  const rows = []

  if (userId.value) {
    rows.push(advancedSearchRow())

    rows.push({
      id: 'aiChat',
      icon: 'sparkles',
      title: t('paletteOpenChat'),
      run: () => {
        chatStore.isOpen = true
      }
    })
  }

  rows.push({
    id: 'reload',
    icon: 'history',
    title: t('reload'),
    run: () => reloadNuxtApp()
  })

  const otherLocale = locale.value === 'en' ? 'et' : 'en'

  rows.push({
    id: `language-${otherLocale}`,
    icon: 'more',
    title: t('paletteLanguage', { name: t(otherLocale === 'en' ? 'languageEnglish' : 'languageEstonian') }),
    run: () => {
      setLocale(otherLocale)
      useAnalytics('click_language', { language: otherLocale })
      reloadNuxtApp()
    }
  })

  if (token.value) {
    rows.push({
      id: 'signOut',
      icon: 'logout',
      title: t('signOut'),
      run: () => logOut()
    })
  }

  return rows.map(withFoldedTitle)
})

function searchEverywhereRow () {
  const q = trimmedQuery.value

  return {
    id: 'searchEverywhere',
    icon: 'search',
    title: t('paletteSearchEverywhere', { q }),
    run: () => navigateTo({ path: `/${accountId.value}`, query: { q } })
  }
}

function searchInMenuRow (menuEntity) {
  const q = trimmedQuery.value

  return {
    id: 'searchInMenu',
    icon: 'search',
    title: t('paletteSearchInMenu', { q, name: getValue(menuEntity.name) }),
    run: () => navigateTo({ path: `/${accountId.value}`, query: { ...queryStringToObject(getValue(menuEntity.query)), q } })
  }
}

function searchInTypeRow () {
  const q = trimmedQuery.value

  return {
    id: 'searchIn',
    icon: 'search',
    title: t('paletteSearchIn', { q, name: queryState.value.entityType.label }),
    run: () => {
      const queryObject = Object.fromEntries(paletteQueryPairs(queryState.value))

      if (q) {
        queryObject.q = q
      }

      navigateTo({ path: `/${accountId.value}`, query: queryObject })
    }
  }
}

function entityRow (entity, source) {
  return {
    id: `${source}-${entity._id}`,
    entityId: entity._id,
    entityName: entity.name,
    hasPhoto: entity.hasPhoto,
    title: entity.name,
    detail: entity.typeLabel,
    isEntityHit: source === 'hit',
    run: () => navigateTo({ path: `/${accountId.value}/${entity._id}`, query: route.query })
  }
}

// MARK: token editing

function focusInput () {
  nextTick(() => inputRef.value?.focus())
}

function acceptEntityType (option) {
  queryState.value = { ...queryState.value, entityType: option, entityTypeTypedText: query.value }
  query.value = ''

  loadProperties(option.typeId)
  focusInput()
}

function acceptFilter (property) {
  queryState.value = { ...queryState.value, draft: { property, condition: 'is', typedText: query.value } }
  query.value = ''

  focusInput()
}

function acceptSort (property) {
  queryState.value = { ...queryState.value, sort: { property, descending: false, typedText: query.value } }
  query.value = ''

  focusInput()
}

// Sealing a value replaces any filter with the same property and condition, since request params are keyed by both.
function commitValue (label, raw) {
  const draft = queryState.value.draft

  if (!draft) return

  const filters = queryState.value.filters.filter((x) => !(x.property.name === draft.property.name && x.condition === draft.condition))

  filters.push({
    property: draft.property,
    condition: draft.condition,
    value: raw,
    valueLabel: label,
    typedText: draft.typedText,
    valueTypedText: query.value
  })

  queryState.value = { ...queryState.value, filters, draft: null }
  query.value = ''

  focusInput()
}

function cycleCondition (index) {
  if (index === undefined) {
    const draft = queryState.value.draft

    if (!draft) return

    queryState.value = { ...queryState.value, draft: { ...draft, condition: paletteNextCondition(draft.condition, draft.property.type) } }
  }
  else {
    const filters = [...queryState.value.filters]
    const filter = filters.at(index)

    filters[index] = { ...filter, condition: paletteNextCondition(filter.condition, filter.property.type) }
    queryState.value = { ...queryState.value, filters }
  }

  focusInput()
}

function removeEntityType () {
  queryState.value = { ...queryState.value, entityType: null, entityTypeTypedText: '' }

  focusInput()
}

function removeFilter (index) {
  queryState.value = { ...queryState.value, filters: queryState.value.filters.filter((x, i) => i !== index) }

  focusInput()
}

function removeDraft () {
  queryState.value = { ...queryState.value, draft: null }

  focusInput()
}

function removeSort () {
  queryState.value = { ...queryState.value, sort: null }

  focusInput()
}

function flipSort () {
  queryState.value = { ...queryState.value, sort: { ...queryState.value.sort, descending: !queryState.value.sort.descending } }

  focusInput()
}

// Undo the last token acceptance, restoring the text it was accepted from.
function removeLastToken () {
  const state = queryState.value

  if (state.draft) {
    query.value = state.draft.typedText
    queryState.value = { ...state, draft: null }
  }
  else if (state.sort) {
    query.value = state.sort.typedText
    queryState.value = { ...state, sort: null }
  }
  else if (state.filters.length > 0) {
    const last = state.filters.at(-1)

    query.value = last.valueTypedText
    queryState.value = { ...state, filters: state.filters.slice(0, -1), draft: { property: last.property, condition: last.condition, typedText: last.typedText } }
  }
  else if (state.entityType) {
    query.value = state.entityTypeTypedText
    queryState.value = { ...state, entityType: null, entityTypeTypedText: '' }
  }
}

async function loadProperties (typeId) {
  const currentRequest = ++propertiesRequestId
  const list = await paletteStore.getProperties(typeId)

  if (currentRequest !== propertiesRequestId) return

  properties.value = list
}

// MARK: grammar suggestions

function rankedMatches (items, folded) {
  return items
    .map((item, index) => ({
      item,
      index,
      quality: Math.max(paletteMatchQuality(item.foldedLabel, folded), paletteMatchQuality(item.foldedName, folded))
    }))
    .filter((x) => x.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map((x) => x.item)
}

function typeSuggestionRows (folded) {
  return rankedMatches(typeOptions.value, folded).slice(0, 3).map((option) => ({
    id: `type-${option.typeId}`,
    icon: 'search-advanced',
    title: t('paletteFilterType', { name: option.label }),
    keyHint: '⇥',
    isGrammar: true,
    run: () => acceptEntityType(option)
  }))
}

function propertySuggestionRows (folded) {
  if (!queryState.value.entityType) return []

  const matches = rankedMatches(properties.value, folded)

  const rows = matches.slice(0, 3).map((property) => ({
    id: `filterBy-${property.name}`,
    icon: 'search-advanced',
    title: t('paletteFilterBy', { name: property.label }),
    keyHint: '⇥',
    isGrammar: true,
    run: () => acceptFilter(property)
  }))

  for (const property of matches.slice(0, 2)) {
    rows.push({
      id: `sortBy-${property.name}`,
      icon: 'sort-ascending',
      title: t('paletteSortBy', { name: property.label }),
      keyHint: '⇥',
      isGrammar: true,
      run: () => acceptSort(property)
    })
  }

  return rows
}

const valueRows = computed(() => {
  const rows = facets.value.map((facet) => ({
    id: `value-${facet.raw}`,
    entityName: facet.label,
    title: facet.label,
    detail: t('entityCount', facet.count),
    isGrammar: true,
    run: () => commitValue(facet.label, facet.raw)
  }))

  const q = trimmedQuery.value

  if (q) {
    rows.push({
      id: 'useValue',
      icon: 'checkmark',
      title: t('paletteUseValue', { q }),
      isGrammar: true,
      run: () => commitValue(q, q)
    })
  }

  return rows
})

// MARK: list assembly

const typedRows = computed(() => {
  const q = trimmedQuery.value
  const folded = foldedQuery.value
  const state = queryState.value

  if (state.draft) return valueRows.value

  if (!stateEmpty.value) {
    const rows = []

    if (q) {
      if (state.entityType) {
        rows.push(searchInTypeRow())
      }
      else {
        rows.push(...typeSuggestionRows(folded))
      }

      rows.push(...propertySuggestionRows(folded))
    }

    rows.push(...entityHits.value.map((x) => entityRow(x, 'hit')))

    return rows
  }

  if (!q) return []

  const scored = []

  if (activeMenu.value) {
    scored.push([searchInMenuRow(activeMenu.value), SEARCH_BAND + 1])
  }

  scored.push([searchEverywhereRow(), SEARCH_BAND])

  for (const row of typeSuggestionRows(folded)) {
    scored.push([row, GRAMMAR_BAND])
  }

  for (const row of [...entityActionRows.value, ...createRows.value, ...appCommandRows.value]) {
    const quality = paletteMatchQuality(row.foldedTitle, folded)

    if (quality > 0) {
      scored.push([row, COMMAND_BAND + quality * 10 + 3])
    }
  }

  for (const row of navigationRows.value) {
    const quality = paletteMatchQuality(row.foldedTitle, folded)

    if (quality > 0) {
      scored.push([row, COMMAND_BAND + quality * 10 + 1])
    }
  }

  for (const hit of entityHits.value) {
    scored.push([entityRow(hit, 'hit'), Math.max(paletteMatchQuality(hit.foldedName, folded), 1)])
  }

  return scored
    .map(([row, score], index) => ({ row, score, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.row)
})

const emptySections = computed(() => {
  const result = []
  const actionRows = entityActionRows.value

  if (actionRows.length > 0) {
    result.push({
      id: 'entity',
      title: [currentTypeLabel.value, currentName.value].filter(Boolean).join(' · '),
      rows: actionRows
    })
  }

  const creates = createRows.value

  if (creates.length > 0) {
    result.push({
      id: 'create',
      title: activeMenu.value ? getValue(activeMenu.value.name) : t('add'),
      rows: creates
    })
  }

  const recentRows = recents.value.filter((x) => x._id !== route.params.entityId).map((x) => entityRow(x, 'recent'))

  if (recentRows.length > 0) {
    result.push({ id: 'recent', title: t('paletteRecent'), rows: recentRows })
  }

  if (userId.value) {
    result.push({ id: 'commands', title: '', rows: [advancedSearchRow()] })
  }

  return result
})

const sections = computed(() => {
  if (isEmptyState.value) return emptySections.value

  const rows = typedRows.value
  const hits = rows.filter((x) => x.isEntityHit)
  const result = [{ id: 'ranked', title: '', rows: rows.filter((x) => !x.isEntityHit) }]

  if (hits.length > 0) {
    result.push({ id: 'hits', title: t('paletteEntities'), rows: hits })
  }

  return result
})

const flatRows = computed(() => sections.value.flatMap((x) => x.rows))

// Sections with flat selection indices assigned in render order.
const indexedSections = computed(() => {
  let index = -1

  return sections.value.map((section) => ({
    ...section,
    rows: section.rows.map((row) => {
      index++

      return { row, index }
    })
  }))
})

const footerSummary = computed(() => {
  let summary = t('entityCount', resultCount.value ?? entityHits.value.length)
  const sort = queryState.value.sort

  if (sort) {
    summary += ` · ${t('paletteSortedBy', { name: sort.property.label })} ${sort.descending ? '↓' : '↑'}`
  }

  return summary
})

// MARK: selection & keyboard

// Grammar rows keep the palette open; everything else closes it first.
function invoke (row) {
  if (!row.isGrammar) {
    paletteStore.close()
  }

  row.run()
}

function onKeydown (event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()

    if (flatRows.value.length === 0) return

    selectedIndex.value = Math.min(selectedIndex.value + 1, flatRows.value.length - 1)
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  }
  else if (event.key === 'Enter') {
    const row = flatRows.value.at(selectedIndex.value)

    if (!row) return

    event.preventDefault()
    invoke(row)
  }
  else if (event.key === 'Tab') {
    event.preventDefault()

    const selected = flatRows.value.at(selectedIndex.value)

    if (selected?.isGrammar) {
      invoke(selected)
    }
    else {
      const first = flatRows.value.find((x) => x.isGrammar)

      if (first) {
        invoke(first)
      }
    }
  }
  else if (event.key === 'Backspace' && !query.value && !stateEmpty.value) {
    event.preventDefault()
    removeLastToken()
  }
  else if (event.key === 'Alt' && queryState.value.draft) {
    event.preventDefault()
    cycleCondition()
  }
}

watch(selectedIndex, () => {
  nextTick(() => {
    listRef.value?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  })
})

// MARK: fetching (live results / value facets)

function clearResults () {
  fetchRequestId++
  entityHits.value = []
  facets.value = []
  resultCount.value = null
}

async function fetchResults () {
  const currentRequest = ++fetchRequestId
  const params = Object.fromEntries(paletteQueryPairs(queryState.value))
  const q = trimmedQuery.value

  if (q) {
    params.q = q
  }

  params.props = '_type.string,name,photo'
  params.limit = 10

  try {
    const { entities, count } = await apiGetEntities(params)

    if (currentRequest !== fetchRequestId) return

    entityHits.value = (entities || []).map((x) => {
      const name = getValue(x.name) || x._id

      return {
        _id: x._id,
        name,
        foldedName: paletteFold(name),
        typeLabel: getValue(x._type),
        hasPhoto: !!x.photo?.length
      }
    })
    resultCount.value = count
  }
  catch {
    if (currentRequest !== fetchRequestId) return

    entityHits.value = []
    resultCount.value = null
  }
}

// Fetch distinct draft-property values with counts via the group= facet query.
async function fetchFacets () {
  const draft = queryState.value.draft

  if (!draft) return

  const currentRequest = ++fetchRequestId
  const property = draft.property
  const searchField = paletteSearchField(property.type)
  const params = Object.fromEntries(paletteQueryPairs(queryState.value))

  delete params.sort
  params.group = `${property.name}.${searchField}`
  params.props = property.name

  const prefix = trimmedQuery.value
  const stringLike = ['string', 'text', 'filename'].includes(searchField)

  if (prefix && stringLike) {
    params[`${property.name}.${searchField}.regex`] = `/${paletteRegexEscape(prefix)}/i`
  }

  try {
    const { entities } = await apiGetEntities(params)

    if (currentRequest !== fetchRequestId) return

    const foldedPrefix = paletteFold(prefix)
    const seen = new Set()
    const collected = []

    for (const entity of entities || []) {
      const facet = facetValue(entity[property.name], property)

      if (!facet || seen.has(facet.raw)) continue
      if (prefix && !stringLike && !paletteFold(facet.label).startsWith(foldedPrefix)) continue

      seen.add(facet.raw)
      collected.push({ ...facet, count: entity._count || 0 })
    }

    facets.value = collected.sort((a, b) => b.count - a.count).slice(0, 8)
  }
  catch {
    if (currentRequest !== fetchRequestId) return

    facets.value = []
  }
}

// Display label + raw API value for one grouped facet row.
function facetValue (values, property) {
  const fields = { number: 'number', counter: 'number', boolean: 'boolean', date: 'date', datetime: 'datetime' }
  const field = fields[property.type] || 'string'
  const value = getValue(values, field)

  if (value === undefined || value === null || value === '') return

  const label = ['date', 'datetime'].includes(field) ? String(value).slice(0, 10) : String(value)
  const raw = field === 'date' ? String(value).slice(0, 10) : String(value)

  return { label, raw }
}

// MARK: lifecycle

watch([query, queryState], () => {
  selectedIndex.value = 0

  if (stateEmpty.value && !trimmedQuery.value) {
    clearResults()
  }
})

watchDebounced([query, queryState], () => {
  if (!paletteStore.isOpen) return
  if (stateEmpty.value && !trimmedQuery.value) return

  if (queryState.value.draft) {
    fetchFacets()
  }
  else {
    fetchResults()
  }
}, { debounce: 300 })

watch(isOpen, (value) => {
  if (!value) return

  selectedIndex.value = 0

  clearResults()
  focusInput()
})

onKeyStroke('Escape', (event) => {
  if (!isOpen.value) return

  event.preventDefault()
  paletteStore.close()
})
</script>

<template>
  <Teleport to="body">
    <transition name="palette">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[2000] flex items-start justify-center bg-black/12 px-6 pt-16 print:hidden md:pt-[120px]"
        @click.self="paletteStore.close()"
      >
        <div class="palette-panel flex max-h-[calc(100vh-8rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[15px] bg-white shadow-2xl">
          <div class="flex items-center gap-2 px-3.5 py-2.5">
            <my-icon
              class="text-sm text-gray-400"
              icon="search"
            />

            <div class="flex min-w-0 grow flex-wrap items-center gap-1.5">
              <palette-chip
                v-if="queryState.entityType"
                :label="queryState.entityType.label"
                @remove="removeEntityType"
              />

              <palette-chip
                v-for="(filter, index) in queryState.filters"
                :key="`${filter.property.name}-${filter.condition}`"
                :condition="filter.condition"
                :label="filter.property.label"
                :value="filter.valueLabel"
                @cycle="cycleCondition(index)"
                @remove="removeFilter(index)"
              />

              <palette-chip
                v-if="queryState.draft"
                kind="draft"
                :condition="queryState.draft.condition"
                :label="queryState.draft.property.label"
                @cycle="cycleCondition()"
                @remove="removeDraft"
              />

              <palette-chip
                v-if="queryState.sort"
                kind="sort"
                :descending="queryState.sort.descending"
                :label="queryState.sort.property.label"
                @flip="flipSort"
                @remove="removeSort"
              />

              <div class="relative min-w-[150px] grow">
                <input
                  ref="inputRef"
                  v-model="query"
                  class="w-full bg-transparent py-0.5 text-base outline-none"
                  :placeholder="stateEmpty ? t('paletteSearchPlaceholder') : ''"
                  @keydown="onKeydown"
                >

                <span
                  v-if="!query && stateEmpty"
                  class="absolute inset-y-0 right-0 flex items-center"
                >
                  <span class="inline-flex h-4 items-center rounded border border-gray-300 px-1 pt-0.5 text-xs leading-none font-medium text-gray-400">{{ paletteShortcutLabel() }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="h-px shrink-0 bg-gray-200" />

          <div
            ref="listRef"
            class="max-h-[360px] overflow-y-auto p-1"
          >
            <template
              v-for="section in indexedSections"
              :key="section.id"
            >
              <div
                v-if="section.title"
                class="truncate px-2.5 pt-2 pb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase"
              >
                {{ section.title }}
              </div>

              <palette-row
                v-for="item in section.rows"
                :key="item.row.id"
                :data-selected="item.index === selectedIndex"
                :detail="item.row.detail"
                :entity-id="item.row.entityId"
                :entity-name="item.row.entityName"
                :folded-query="foldedQuery"
                :has-photo="item.row.hasPhoto"
                :icon="item.row.icon"
                :key-hint="item.row.keyHint"
                :selected="item.index === selectedIndex"
                :title="item.row.title"
                @select="invoke(item.row)"
              />
            </template>

            <div
              v-if="flatRows.length === 0"
              class="py-4 text-center text-sm text-gray-400"
            >
              {{ isEmptyState ? t('paletteNoRecents') : t('noResults') }}
            </div>
          </div>

          <div class="h-px shrink-0 bg-gray-200" />

          <div class="flex items-center gap-1 px-3.5 py-2 text-xs text-gray-400">
            <template v-if="queryState.draft">
              <span class="palette-keycap">⌥</span>
              <span>{{ t('paletteOptionHint') }}</span>
            </template>

            <span v-else-if="!stateEmpty">{{ footerSummary }}</span>

            <span v-else>{{ t('paletteFooterHint') }}</span>

            <div class="grow" />

            <template v-if="!stateEmpty && !queryState.draft">
              <span class="palette-keycap">⌫</span>
              <span>{{ t('paletteBackspaceHint') }}</span>
            </template>

            <template v-else>
              <span class="palette-keycap pb-0.5">↑</span>
              <span class="palette-keycap pb-0.5">↓</span>
              <span class="palette-keycap pt-1">↩</span>
              <span class="palette-keycap">esc</span>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
@reference "tailwindcss";

.palette-keycap {
  @apply inline-flex h-4 items-center rounded border border-gray-300 px-1 text-xs leading-none font-medium text-gray-500;
}

.palette-enter-active,
.palette-leave-active {
  transition: opacity 0.15s ease-out;
}

.palette-enter-active .palette-panel,
.palette-leave-active .palette-panel {
  transition: transform 0.15s ease-out;
  transform-origin: top center;
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from .palette-panel,
.palette-leave-to .palette-panel {
  transform: scale(0.98);
}
</style>

<i18n lang="yaml">
  en:
    paletteSearchPlaceholder: Search, or type a command…
    paletteFooterHint: Type to search, or pick an action
    paletteOptionHint: cycles the condition
    paletteBackspaceHint: removes last token
    paletteRecent: Recent
    paletteNoRecents: No recent entities
    noResults: No entities found
    paletteEntities: Matching entities
    paletteNavigate: Navigate
    paletteGoTo: Go to {name}
    paletteGoDashboard: Go to Dashboard
    paletteMyProfile: Go to my profile
    paletteSwitchDatabase: Switch to {name}
    paletteOpenChat: Open Entu AI
    paletteLanguage: 'Language: {name}'
    paletteSearchEverywhere: Search “{q}” everywhere
    paletteSearchInMenu: Search “{q}” in {name}
    paletteSearchIn: Search “{q}” in {name}
    paletteFilterType: '{name} — filter type…'
    paletteFilterBy: Filter by {name}…
    paletteSortBy: Sort by {name}…
    paletteSortedBy: sorted by {name}
    paletteUseValue: Use “{q}”
    entityCount: '{n} entity | {n} entities'
    addOne: New {name}
    addOneChild: Add {name}
    add: New …
    advancedSearch: Advanced Search
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: Rights
    history: History
    openInNewTab: Open in New Tab
    reload: Reload
    languageEnglish: English
    languageEstonian: Estonian
    signOut: Sign Out
  et:
    paletteSearchPlaceholder: Otsi või sisesta käsk…
    paletteFooterHint: Otsimiseks kirjuta või vali tegevus
    paletteOptionHint: vahetab tingimust
    paletteBackspaceHint: kustutab viimase filtri
    paletteRecent: Hiljutised
    paletteNoRecents: Hiljutisi objekte pole
    noResults: Objekte ei leitud
    paletteEntities: Leitud objektid
    paletteNavigate: Navigeeri
    paletteGoTo: Ava {name}
    paletteGoDashboard: Ava töölaud
    paletteMyProfile: Ava minu profiil
    paletteSwitchDatabase: 'Vaheta: {name}'
    paletteOpenChat: Ava Entu AI
    paletteLanguage: 'Keel: {name}'
    paletteSearchEverywhere: Otsi “{q}” kõikjalt
    paletteSearchInMenu: Otsi “{q}” loendist {name}
    paletteSearchIn: Otsi “{q}” tüübist {name}
    paletteFilterType: '{name} — objektitüüp…'
    paletteFilterBy: 'Filtreeri: {name}…'
    paletteSortBy: 'Sordi: {name}…'
    paletteSortedBy: 'sorditud: {name}'
    paletteUseValue: Kasuta “{q}”
    entityCount: '{n} objekt | {n} objekti'
    addOne: Uus {name}
    addOneChild: Lisa {name}
    add: Uus …
    advancedSearch: Täpsem otsing
    edit: Muuda
    duplicate: Dubleeri
    parents: Kuuluvus
    rights: Õigused
    history: Ajalugu
    openInNewTab: Ava uues vahekaardis
    reload: Laadi uuesti
    languageEnglish: Inglise
    languageEstonian: Eesti
    signOut: Välju
</i18n>
