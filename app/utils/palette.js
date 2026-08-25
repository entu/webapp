// Command-palette query grammar helpers, mirroring the native app's PaletteQuery model.

// Condition → API operator suffix appended to the filter key ('' = exact match).
const CONDITION_SUFFIXES = {
  is: '',
  isNot: 'ne',
  contains: 'regex',
  before: 'lt',
  after: 'gt'
}

// Case- and diacritic-insensitive normalization used for all palette matching.
export function paletteFold (text = '') {
  return String(text).toLowerCase().normalize('NFD').replaceAll(/[̀-ͯ]/g, '')
}

// 3 = prefix, 2 = word-prefix, 1 = substring, 0 = no match; both arguments pre-folded.
export function paletteMatchQuality (foldedText, foldedQuery) {
  if (!foldedQuery) return 0
  if (foldedText.startsWith(foldedQuery)) return 3
  if (foldedText.split(/[^\p{L}\p{N}]+/u).some((word) => word.startsWith(foldedQuery))) return 2
  if (foldedText.includes(foldedQuery)) return 1

  return 0
}

// Escape regex metacharacters; '/' becomes '.' because the API splits the /pattern/flags form naively.
export function paletteRegexEscape (value) {
  return String(value).replaceAll(/[\\^$.|?*+()[\]{}]/g, String.raw`\$&`).replaceAll('/', '.')
}

// The datatype segment of the Mongo path — shared with the advanced search.
export function paletteSearchField (type) {
  return propertySearchField(type)
}

// Ordered datatypes cycle is/before/after; everything else is/is not/contains.
export function paletteConditionCycle (type) {
  return ['number', 'counter', 'date', 'datetime'].includes(type)
    ? ['is', 'before', 'after']
    : ['is', 'isNot', 'contains']
}

export function paletteNextCondition (condition, type) {
  const cycle = paletteConditionCycle(type)

  return cycle.at((cycle.indexOf(condition) + 1) % cycle.length)
}

export function paletteEmptyState () {
  return {
    entityType: null,
    entityTypeTypedText: '',
    filters: [],
    draft: null,
    sort: null
  }
}

export function paletteStateIsEmpty (queryState) {
  return !queryState.entityType && queryState.filters.length === 0 && !queryState.draft && !queryState.sort
}

// Ordered query pairs (without q) in the same shape the advanced search applies to the list view.
export function paletteQueryPairs (queryState) {
  const pairs = []

  if (queryState.entityType) {
    pairs.push(['_type.string', queryState.entityType.typeName])
  }

  for (const filter of queryState.filters) {
    let key = `${filter.property.name}.${paletteSearchField(filter.property.type)}`
    const suffix = CONDITION_SUFFIXES[filter.condition]

    if (suffix) {
      key += `.${suffix}`
    }

    const value = filter.condition === 'contains' ? `/${paletteRegexEscape(filter.value)}/i` : filter.value

    pairs.push([key, value])
  }

  if (queryState.sort) {
    pairs.push(['sort', `${queryState.sort.descending ? '-' : ''}${queryState.sort.property.name}.${paletteSearchField(queryState.sort.property.type)}`])
  }

  return pairs
}
