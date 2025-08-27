<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NEmpty, NSelect } from 'naive-ui'

const { t } = useI18n()

const value = defineModel({ type: String, default: undefined })

const props = defineProps({
  query: { type: String, default: undefined },
  exclude: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] }
})

const referenceSearch = ref('')
const referenceLimit = ref(100)
const referenceCount = ref(null)
const rawReferences = ref(null)
const searchingReferences = ref(false)

const referenceOptions = computed(() => {
  if (rawReferences.value) {
    return rawReferences.value?.filter((x) => !props.exclude?.includes(x._id))?.map((x) => ({
      class: '!pr-2',
      label: getValue(x.name) || x._id,
      type: getValue(x._type),
      value: x._id
    })) || []
  }
  else {
    return props.options
  }
})

watchDebounced(referenceSearch, async (q = '') => {
  rawReferences.value = null

  searchingReferences.value = true
  referenceCount.value = null

  let filter = {
    q,
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
}, { debounce: 500, immediate: true, maxWait: 5000 })

function searchReferences (query) {
  referenceSearch.value = query
}

function renderReferenceOption (option) {
  return h('div',
    { class: 'flex gap-3 items-center justify-between' },
    [
      h('div', { class: 'text-ellipsis overflow-hidden' }, option.label),
      h('div', { class: 'px-1 rounded bg-blue-50 text-xs text-gray-500' }, option.type)
    ]
  )
}
</script>

<template>
  <n-select
    v-model:value="value"
    clearable
    filterable
    remote
    :loading="searchingReferences"
    :options="referenceOptions"
    :render-label="renderReferenceOption"
    @search="searchReferences"
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

<style>
.n-base-select-option__content {
  @apply w-full;
}
</style>

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
