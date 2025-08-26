<script setup>
import { NModal, NForm, NFormItem, NInput, NSelect, NInputNumber, NDatePicker, NButton, NDivider, NSwitch, NRadioGroup, NRadioButton, NInputGroup } from 'naive-ui'

const { t } = useI18n()
const route = useRoute()

const show = defineModel('show', { type: Boolean, default: false })

const emit = defineEmits(['search'])

// Form data
const searchForm = ref({
  q: route.query.q || '',
  types: [],
  sort: route.query.sort || '',
  sortDirection: '',
  properties: []
})

const entityTypeOptions = ref([])
const properties = ref([])
const loading = ref(false)

// Sort options with common fields
const sortOptions = [
  { value: '', label: t('id') },
  { value: '_created.datetime', label: t('created') },
  { value: '_changed.datetime', label: t('changed') },
  { value: 'name.string', label: t('name') }
]

// Initialize with existing query parameters
watch(() => route.query, () => {
  searchForm.value.q = route.query.q || ''
  searchForm.value.types = []
  searchForm.value.properties = []

  // Parse sort and direction
  const sortParam = route.query.sort || ''
  if (sortParam.startsWith('-')) {
    searchForm.value.sort = sortParam.substring(1)
    searchForm.value.sortDirection = '-'
  }
  else {
    searchForm.value.sort = sortParam
    searchForm.value.sortDirection = ''
  }

  if (route.query['_type.string']) {
    searchForm.value.types = [route.query['_type.string']]
  }
  if (route.query['_type.string.in']) {
    searchForm.value.types = route.query['_type.string'].split(',')
  }

  Object.keys(route.query).forEach((key) => {
    if (['q', '_type.string', '_type.string.in', 'sort', 'limit', 'skip'].includes(key)) return

    const fieldArray = key.split('.')
    const field = fieldArray.join('.')
    const fieldType = getPropertyType(field)

    let operator = fieldArray.at(-1)
    let value = route.query[key]

    if (!['exists', 'gt', 'gte', 'lt', 'lte', 'ne', 'regex'].includes(operator)) {
      operator = ''
    }
    else {
      fieldArray.pop()
    }

    if (fieldType === 'boolean' && operator !== 'exists') {
      value = value.toLowerCase() === 'true'
    }
    else if (fieldType === 'number' || fieldType === 'filesize') {
      value = Number(value)
    }
    else if (fieldType === 'date' || fieldType === 'datetime') {
      value = Number(value)
    }

    searchForm.value.properties.push({
      field,
      operator,
      value
    })
  })

  if (searchForm.value.properties.length === 0) {
    searchForm.value.properties = [{ field: '', operator: '' }]
  }
}, { immediate: true })

watch(() => searchForm.value.types, async (newTypes) => {
  if (!newTypes?.length) {
    properties.value = []
    return
  }

  loading.value = true

  const response = await apiGetEntities({
    '_type.string': 'property',
    '_parent.string.in': newTypes.join(','),
    props: '_parent,name,label,type',
    limit: 1000
  })

  const propOptions = response.entities?.map((x) => ({
    value: `${getValue(x.name).trim()}.${getPropertySearchField(getValue(x.type).trim())}`,
    label: getValue(x.label).trim() || getValue(x.name).trim(),
    parent: getValue(x._parent).trim(),
    name: getValue(x.name).trim(),
    type: getValue(x.type).trim()
  }))?.reduce((acc, curr) => {
    const existingValue = acc.find((x) => x.value === curr.value)
    const existingLabel = acc.find((x) => x.label === curr.label)

    if (existingValue && existingLabel) {
      // existing.label = `${existing.label} (${curr.parent}.${curr.name})`
    }
    else if (existingValue) {
      existingValue.label = [...new Set([...existingValue.label.split(', '), curr.label])].sort().join(', ')
    }
    else if (existingLabel) {
      existingLabel.label = `${existingLabel.label} (${existingLabel.parent}.${existingLabel.name})`
      curr.label = `${curr.label} (${curr.parent}.${curr.name})`

      acc.push(curr)
    }
    else {
      acc.push(curr)
    }

    return acc
  }, [])

  propOptions?.sort((a, b) => a.label.localeCompare(b.label))

  properties.value = [
    { value: '_id', label: '_id' },
    { value: '_created', label: '_created.at.datetime' },
    ...propOptions
  ]

  loading.value = false
}, { immediate: true })

watch(() => searchForm.value.properties.map((f) => f.field), (newFields, oldFields) => {
  if (!oldFields) return

  newFields.forEach((newField, index) => {
    const oldField = oldFields[index]

    if (oldField && newField && getPropertyType(oldField) !== getPropertyType(newField)) {
      searchForm.value.properties[index].value = undefined
    }
  })
}, { deep: true })

function addCustomFilter () {
  searchForm.value.properties.push({ field: '', operator: '' })
}

function removeCustomFilter (index) {
  searchForm.value.properties.splice(index, 1)
}

function getPropertySearchField (propertyType) {
  switch (propertyType) {
    case 'file':
      return 'filename'
    case 'reference':
      return 'string'
    default:
      return propertyType
  }
}

function getPropertyType (fieldName) {
  if (!fieldName) return 'string'

  const fieldArray = fieldName.split('.').filter(Boolean)
  const lastField = fieldArray.at(-1)

  if (fieldArray.length === 1) return 'string'
  if (!['boolean', 'date', 'datetime', 'filesize', 'number', 'reference'].includes(lastField)) return 'string'

  return lastField
}

function getOperatorOptions (fieldName) {
  const type = getPropertyType(fieldName)

  if (['boolean', 'reference'].includes(type)) {
    return [
      { value: 'exists', label: t('exists') },
      { value: '', label: t('equals') },
      { value: 'ne', label: t('notEqual') }
    ]
  }

  return [
    { value: 'exists', label: t('exists') },
    { value: '', label: t('equals') },
    { value: 'ne', label: t('notEqual') },
    { value: 'lt', label: t('lessThan') },
    { value: 'lte', label: t('lessThanOrEqual') },
    { value: 'gt', label: t('greaterThan') },
    { value: 'gte', label: t('greaterThanOrEqual') },
    { value: 'in', label: t('in') },
    { value: 'regex', label: t('regex') }
  ]
}

function handleSearch () {
  const query = {}

  if (searchForm.value.q) {
    query.q = searchForm.value.q
  }

  if (searchForm.value.types?.length === 1) {
    query['_type.string'] = searchForm.value.types.at(0)
  }
  else if (searchForm.value.types?.length > 0) {
    query['_type.string.in'] = searchForm.value.types.join(',')
  }

  searchForm.value.properties.forEach((filter) => {
    if (filter.value === undefined || filter.value === '') return

    const key = [filter.field, filter.operator].filter(Boolean).join('.')

    query[key] = filter.value
  })

  if (searchForm.value.sort) {
    query.sort = `${searchForm.value.sortDirection}${searchForm.value.sort}`
  }

  emit('search', query)
  show.value = false
}

function resetForm () {
  searchForm.value = {
    q: '',
    types: [],
    sort: '',
    sortDirection: '',
    properties: [{ field: '', operator: '' }]
  }
}

onMounted(async () => {
  const response = await apiGetEntities({
    '_type.string': 'entity',
    limit: 1000,
    props: 'name,label'
  })

  entityTypeOptions.value = response.entities?.map((x) => ({
    value: getValue(x.name),
    label: getValue(x.label) || getValue(x.name)
  }))?.sort((a, b) => a.label.localeCompare(b.label)) || []
})
</script>

<template>
  <n-modal
    v-model:show="show"
    class="w-full max-w-4xl"
    closable
    draggable
    preset="card"
    size="small"
    :segmented="{ content: true }"
    :title="t('title')"
  >
    <n-form
      :model="searchForm"
      label-placement="top"
    >
      <div class="flex items-end gap-3">
        <n-form-item
          class="flex-1"
          :label="t('searchQuery')"
          :show-feedback="false"
        >
          <n-input
            v-model:value="searchForm.q"
            clearable
            :placeholder="t('searchQueryPlaceholder')"
            :show-feedback="false"
          />
        </n-form-item>

        <n-form-item
          class="flex-1"
          :label="t('entityTypes')"
          :show-feedback="false"
        >
          <n-select
            v-model:value="searchForm.types"
            filterable
            clearable
            max-tag-count="responsive"
            multiple
            :options="entityTypeOptions"
            :placeholder="t('entityTypesPlaceholder')"
          />
        </n-form-item>

        <n-form-item
          :label="t('sortBy')"
          :show-feedback="false"
        >
          <div class="flex gap-1">
            <n-select
              v-model:value="searchForm.sort"
              class="w-28"
              :options="sortOptions"
            />

            <n-radio-group
              v-model:value="searchForm.sortDirection"
              name="sortDirection"
            >
              <n-radio-button
                class="flex items-center justify-center !px-2"
                :title="t('ascending')"
                :value="''"
              >
                <my-icon
                  icon="arrow-down"
                  class="text-xs"
                />
              </n-radio-button>
              <n-radio-button
                class="flex items-center justify-center !px-2"
                :title="t('descending')"
                :value="'-'"
              >
                <my-icon
                  icon="arrow-up"
                  class="text-xs"
                />
              </n-radio-button>
            </n-radio-group>
          </div>
        </n-form-item>
      </div>

      <n-divider>{{ t('propertyFilters') }}</n-divider>

      <div class="space-y-8">
        <div
          v-for="(filter, index) in searchForm.properties"
          :key="index"
          class="flex items-end gap-3"
        >
          <n-form-item
            class="flex-1"
            :label="t('fieldName')"
            :show-feedback="false"
          >
            <n-input
              v-if="!searchForm?.types?.length"
              v-model:value="filter.field"
              clearable
              :placeholder="t('fieldNamePlaceholderText')"
            />
            <n-select
              v-else
              v-model:value="filter.field"
              filterable
              :loading="loading"
              :options="properties"
              :placeholder="t('fieldNamePlaceholder')"
            />
          </n-form-item>

          <n-form-item
            class="w-48"
            :label="t('operator')"
            :show-feedback="false"
          >
            <n-select
              v-model:value="filter.operator"
              :options="getOperatorOptions(filter.field)"
            />
          </n-form-item>

          <n-form-item
            class="flex-1"
            :label="t('value')"
            :show-feedback="false"
          >
            <n-switch
              v-if="getPropertyType(filter.field) === 'boolean' || filter.operator === 'exists'"
              v-model:value="filter.value"
              :checked-value="true"
              :unchecked-value="false"
            />
            <n-input-number
              v-else-if="getPropertyType(filter.field) === 'number' || getPropertyType(filter.field) === 'filesize'"
              v-model:value="filter.value"
              class="w-full"
              clearable
            />
            <n-date-picker
              v-else-if="getPropertyType(filter.field) === 'date'"
              v-model:value="filter.value"
              class="w-full"
              clearable
              type="date"
            />
            <n-date-picker
              v-else-if="getPropertyType(filter.field) === 'datetime'"
              v-model:value="filter.value"
              class="w-full"
              clearable
              type="datetime"
            />
            <n-input
              v-else
              v-model:value="filter.value"
              show-feedback="false"
              :placeholder="t('valuePlaceholder')"
            />
          </n-form-item>

          <n-form-item :show-feedback="false">
            <n-button
              quaternary
              type="error"
              @click="removeCustomFilter(index)"
            >
              <my-icon icon="delete" />
            </n-button>
          </n-form-item>
        </div>

        <n-button
          class="w-full"
          dashed
          @click="addCustomFilter"
        >
          <template #icon>
            <my-icon icon="add" />
          </template>

          {{ t('addFilter') }}
        </n-button>
      </div>
    </n-form>

    <template #action>
      <div class="flex justify-between">
        <n-button @click="resetForm">
          {{ t('reset') }}
        </n-button>

        <n-button
          type="primary"
          @click="handleSearch"
        >
          <template #icon>
            <my-icon icon="search" />
          </template>
          {{ t('search') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<i18n lang="yaml">
  en:
    title: Search

    searchQuery: Search Text
    searchQueryPlaceholder: Enter search terms...
    entityTypes: Entity Type
    entityTypesPlaceholder: Select entity types
    sortBy: Sort By
    ascending: Ascending
    descending: Descending
    id: ID
    created: Created
    changed: Changed
    name: Name

    propertyFilters: Filter by Property Value

    fieldName: Property
    fieldNamePlaceholder: Select property
    fieldNamePlaceholderText: Input property name and field
    operator: Operator
    value: Value
    valuePlaceholder: Enter value

    addFilter: Add Filter

    search: Search
    reset: Reset

    exists: Exists
    equals: Equals
    notEqual: Not Equal
    lessThan: Less Than
    lessThanOrEqual: Less Than or Equal
    greaterThan: Greater Than
    greaterThanOrEqual: Greater Than or Equal
    in: In List
    regex: Regular Expression
  et:
    title: Otsing

    searchQuery: Otsi tekst
    searchQueryPlaceholder: Sisesta otsinguterminid...
    entityTypes: Olemitüübid
    entityTypesPlaceholder: Vali objekti tüüp
    sortBy: Järjesta
    ascending: Kasvav
    descending: Kahanev
    id: ID
    created: Loodud
    changed: Muudetud
    name: Nimi

    propertyFilters: Filtreeri parameetrite järgi

    fieldName: Välja nimi
    fieldNamePlaceholder: Vali parameeter
    fieldNamePlaceholderText: Sisesta parameetti nimi ja väli
    operator: Operaator
    value: Väärtus
    valuePlaceholder: Filtri väärtus

    addFilter: Lisa filter

    search: Otsi
    reset: Lähtesta

    exists: Eksisteerib
    equals: Võrdub
    notEqual: Ei võrdu
    lessThan: Väiksem kui
    lessThanOrEqual: Väiksem või võrdne
    greaterThan: Suurem kui
    greaterThanOrEqual: Suurem või võrdne
    in: Nimekirjas
    regex: Regulaaravaldis
</i18n>
