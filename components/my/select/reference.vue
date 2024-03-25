<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NEmpty, NSelect } from 'naive-ui'

const { t } = useI18n()

const value = defineModel({ type: String, default: undefined })

const props = defineProps({
  query: { type: String, default: undefined },
  values: { type: Array, default: () => [] }
})

const referenceSearch = ref('')
const referenceLimit = ref(100)
const referenceCount = ref(null)
const rawReferences = ref(null)
const searchingReferences = ref(false)

const referenceOptions = computed(() => {
  if (rawReferences.value) {
    return rawReferences.value?.map(x => ({ value: x._id, label: getValue(x.name) || x._id, type: getValue(x._type) })) || []
  } else {
    return props.values
  }
})

watchDebounced(referenceSearch, async (value = '') => {
  rawReferences.value = null

  if (value === '') return

  searchingReferences.value = true
  referenceCount.value = null

  let filter = {
    q: value,
    props: [
      '_type.string',
      'name'
    ],
    sort: 'name.string',
    limit: referenceLimit.value
  }

  if (props.query) {
    filter = { ...queryStringToObject(props.query), ...filter }
  }

  const { entities, count } = await apiGetEntities(filter)

  rawReferences.value = entities
  referenceCount.value = count

  searchingReferences.value = false
}, { debounce: 500, maxWait: 5000 })

function searchReferences (query) {
  referenceSearch.value = query
}

function renderReferenceOption (option) {
  return h('div',
    { class: 'flex gap-3 items-center' },
    [
      h('div', { }, option.label),
      h('div', { class: 'px-2 rounded bg-blue-50 text-xs text-gray-500' }, option.type)
    ]
  )
}
</script>

<template>
  <n-select
    v-model:value="value"
    filterable
    remote
    :loading="searchingReferences"
    :options="referenceOptions"
    :render-label="renderReferenceOption"
    @search="searchReferences"
    @focus="searchReferences(' ')"
  >
    <template
      v-if="referenceCount > referenceLimit"
      #action
    >
      <div class="text-center text-xs">
        {{ t('count', referenceCount - referenceLimit) }}
      </div>
    </template>

    <template
      v-if="searchingReferences"
      #empty
    >
      ...
    </template>

    <template
      v-else-if="rawReferences?.length === 0"
      #empty
    >
      <n-empty :description="t('noResults')" />
    </template>

    <template
      v-else
      #empty
    >
      {{ t('doSearch') }}
    </template>
  </n-select>
</template>

<i18n lang="yaml">
  en:
    doSearch: Search Entity
    count: 'No entities found | Found {n} more entity. Refine your search. | Found {n} more entities. Refine your search.'
    noResults: No entities found
  et:
    doSearch: Otsi objekti
    count: 'Objekte ei leitud | Lisaks leiti veel {n} objekt. Täpsusta otsingut. | Leiti veel {n} objekti. Täpsusta otsingut.'
    noResults: Objekte ei leitud
</i18n>
