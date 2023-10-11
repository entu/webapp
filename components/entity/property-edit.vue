<script setup>
import { NDatePicker, NInput, NInputNumber, NSelect, NSwitch } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: undefined },
  decimals: { type: Number, default: 0 },
  isMultilingual: { type: Boolean, default: false },
  property: { type: String, default: undefined },
  referenceQuery: { type: String, default: undefined },
  set: { type: Array, default: () => [] },
  type: { type: String, default: undefined },
  values: { type: Array, default: () => [] }
})

const emit = defineEmits(['update'])

const { t } = useI18n()

const referenceSearch = ref('')
const referenceLimit = ref(100)
const referenceCount = ref(null)
const rawReferences = ref(null)
const searchingReferences = ref(false)

const { cloned: oldValues } = useCloned(props.values)
const { cloned: newValues } = useCloned(props.values)

const languageOptions = [
  { value: 'en', label: 'EN' },
  { value: 'et', label: 'ET' }
]

const setOptions = computed(() => props.set.map(x => ({ value: x, label: x })).sort())

const referenceOptions = computed(() => {
  if (rawReferences.value) {
    return rawReferences.value?.map(x => ({ value: x._id, label: getValue(x.name) || x._id, type: getValue(x._type) })) || []
  } else {
    return props.values.filter(x => !!x._id).map(x => ({ value: x.reference, label: x.string })) || []
  }
})

const fileList = computed(() => props.type === 'file'
  ? props.values.map(x => ({
    id: x._id,
    name: x.filename,
    url: `/${accountId.value}/file/${x._id}`,
    status: 'finished'
  }))
  : []
)

watch(newValues, (values) => {
  values = values.map((x) => {
    if (x.date) x.date = new Date(x.date).getTime()
    if (x.datetime) x.datetime = new Date(x.datetime).getTime()

    return x
  })
}, { deep: true, immediate: true })

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

  if (props.referenceQuery) {
    filter = { ...queryStringToObject(props.referenceQuery), ...filter }
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

function updateValue (newValue) {
  const oldValue = oldValues.value.find(x => x._id === newValue._id) || {}
  const _id = newValue._id
  const language = newValue.language
  let property = null
  let value = null

  switch (props.type) {
    case 'text':
      property = 'string'
      break
    default:
      property = props.type
      break
  }

  value = newValue[property]

  if (typeof value === 'string') value = value.trim() || null
  if (oldValue[property] instanceof Date) value = new Date(value) || null

  if (value === oldValue[property] && language === oldValue.language) return

  if (value !== null && !_id) {
    addValue(value, language)
  } else if (value !== null && _id) {
    editValue(_id, value, language)
  } else if (value === null && _id) {
    deleteValue(_id)
  }
}

function addValue (value, language) {
  console.log('add', value, language)
}

function editValue (_id, value, language) {
  console.log('edit', _id, value, language)
}

function deleteValue (_id) {
  console.log('delete', _id)
}
</script>

<template>
  <div class="w-full flex flex-col items-start gap-1">
    <div
      v-for="value in newValues"
      :key="value._id"
      class="w-full flex flex-row items-center justify-between gap-1"
    >
      <n-input
        v-if="type === 'string' && set.length === 0"
        v-model:value="value.string"
        clearable
        placeholder=""
        @blur="updateValue(value)"
      />

      <n-select
        v-else-if="type === 'string' && set.length > 0"
        v-model:value="value.string"
        clearable
        placeholder=""
        :options="setOptions"
        @update:value="updateValue(value)"
      />

      <n-input
        v-else-if="type === 'text'"
        v-model:value="value.string"
        placeholder=""
        type="textarea"
        :autosize="{
          minRows: 3,
          maxRows: 15
        }"
        @blur="updateValue(value)"
      />

      <n-input-number
        v-else-if="type === 'number'"
        v-model:value="value.number"
        class="w-full"
        clearable
        placeholder=""
        :precision="decimals"
        @blur="updateValue(value)"
      />

      <div
        v-else-if="type === 'boolean'"
        class="w-full"
      >
        <n-switch
          v-model:value="value.boolean"
          :unchecked-value="null"
          @update:value="updateValue(value)"
        />
      </div>

      <n-date-picker
        v-else-if="type === 'date'"
        v-model:value="value.date"
        class="w-full"
        clearable
        placeholder=""
        type="date"
        :first-day-of-week="0"
        @update:value="updateValue(value)"
      />

      <n-date-picker
        v-else-if="type === 'datetime'"
        v-model:value="value.date"
        class="w-full"
        clearable
        placeholder=""
        type="datetime"
        :first-day-of-week="0"
        @update:value="updateValue(value)"
      />

      <n-select
        v-else-if="type === 'reference'"
        v-model:value="value.reference"
        clearable
        filterable
        placeholder=""
        remote
        :loading="searchingReferences"
        :options="referenceOptions"
        :render-label="renderReferenceOption"
        @search="searchReferences"
        @update:value="updateValue(value)"
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
          {{ t('noResults') }}
        </template>
        <template
          v-else
          #empty
        >
          {{ t('doSearch') }}
        </template>
      </n-select>

      <n-select
        v-if="isMultilingual"
        v-model:value="value.language"
        class="!w-20 self-start"
        placeholder=""
        :options="languageOptions"
        @update:value="updateValue(value)"
      />
    </div>
  </div>
  <!-- <pre class="text-xs">{{ props }}</pre> -->
</template>

<i18n lang="yaml">
  en:
    doSearch: Search Entity
    noResults: no entities found
    count: 'no entities found | Found {n} more entity. Refine your search. | Found {n} more entities. Refine your search.'
  et:
    doSearch: Otsi objekti
    noResults: objekte ei leitud
    count: 'objekte ei leitud | Leiti veel {n} objekt. Täpsusta otsingut. | Leiti veel {n} objekti. Täpsusta otsingut.'
</i18n>
