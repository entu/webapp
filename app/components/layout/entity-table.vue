<script setup>
import { NEmpty, NSpin, NPopover } from 'naive-ui'

const route = useRoute()
const { t } = useI18n()
const { accountId } = useAccount()

const listElement = ref(null)
const entitiesList = ref([])
const entitiesCount = ref(null)
const limit = ref(Math.ceil(window.innerHeight / 48) + 3)
const skip = ref(0)
const isLoading = ref(false)
const isLoadingOnScroll = ref(false)
const locationSearch = ref(null)
const scrollIdx = ref(0)
const sortField = ref(null)
const sortDirection = ref('asc')

const { y: listElementScroll } = useScroll(listElement)

const debouncedScroll = useDebounceFn(async () => {
  await navigateTo({ path: `/${accountId.value}/${entitiesList.value.at(scrollIdx.value)._id}`, query: route.query })
}, 300)

const isQuery = computed(() => Object.keys(route.query).length > 0)

const tableColumnsWithTypes = computed(() => {
  if (!entitiesList.value.length) return [{ name: 'name', type: 'string' }]

  const columnsWithTypes = []

  // Always add name first
  columnsWithTypes.push({ name: 'name', type: 'string' })

  // Get all unique property names (excluding name and system properties)
  const allKeys = entitiesList.value
    .flatMap((entity) => Object.keys(entity))
    .filter((key) => !key.startsWith('_') && key !== 'name')

  const uniqueKeys = [...new Set(allKeys)]

  // For each property, determine its type by examining the values
  uniqueKeys.forEach((propertyName) => {
    let detectedType = 'string' // default fallback

    // Look through entities to find the first non-empty value for this property
    for (const entity of entitiesList.value) {
      const propertyValues = entity[propertyName]
      if (propertyValues && propertyValues.length > 0) {
        const firstValue = propertyValues[0]

        // Determine type based on which property exists in the value object
        if (firstValue.number !== undefined) {
          detectedType = 'number'
          break
        }
        else if (firstValue.boolean !== undefined) {
          detectedType = 'boolean'
          break
        }
        else if (firstValue.reference !== undefined) {
          detectedType = 'reference'
          break
        }
        else if (firstValue.date !== undefined) {
          detectedType = 'date'
          break
        }
        else if (firstValue.datetime !== undefined) {
          detectedType = 'datetime'
          break
        }
        else if (firstValue.filename !== undefined) {
          detectedType = 'filename'
          break
        }
        else if (firstValue.filesize !== undefined) {
          detectedType = 'filesize'
          break
        }
        else if (firstValue.string !== undefined) {
          detectedType = 'string'
          break
        }
      }
    }

    columnsWithTypes.push({ name: propertyName, type: detectedType })
  })

  return columnsWithTypes
})

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
  if (e.code === 'ArrowDown' && scrollIdx.value < entitiesList.value.length - 1) scrollIdx.value++
  if (e.code === 'ArrowUp' && scrollIdx.value > 0) scrollIdx.value--

  listElementScroll.value = scrollIdx.value * 48 - 148

  debouncedScroll()
})

watch(() => route.query, (value) => {
  const newSearch = new URLSearchParams(value).toString()
  if (locationSearch.value === newSearch) return

  // Update sort state from URL
  if (value.sort) {
    const sortParam = value.sort
    const isDescending = sortParam.startsWith('-')
    const fieldName = isDescending ? sortParam.substring(1) : sortParam

    sortDirection.value = isDescending ? 'desc' : 'asc'
    sortField.value = fieldName.includes('.') ? fieldName.split('.')[0] : fieldName
  }
  else {
    sortField.value = null
    sortDirection.value = 'asc'
  }

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

  const { entities, count } = await apiGetEntities({
    ...route.query,
    limit: limit.value,
    skip: skip.value
  })

  entitiesList.value = [...entitiesList.value, ...entities]
  entitiesCount.value = count
  skip.value += limit.value

  scrollIdx.value = entitiesList.value.findIndex((x) => x._id === route.params.entityId) || 0

  isLoading.value = false
}

function handleSort (column) {
  // If clicking the same column, toggle direction; otherwise start with 'asc'
  const newSortDirection = sortField.value === column && sortDirection.value === 'asc' ? 'desc' : 'asc'

  sortField.value = column
  sortDirection.value = newSortDirection

  // Find the column type to build proper sort parameter
  const propertyType = tableColumnsWithTypes.value.find((col) => col.name === column)?.type || 'string'

  // Build sort parameter for API with property type
  const sortParam = `${newSortDirection === 'desc' ? '-' : ''}${column}.${propertyType}`

  // Update URL with new sort parameter
  navigateTo({ query: { ...route.query, sort: sortParam } })
}
</script>

<template>
  <div class="flex h-full flex-col print:hidden">
    <layout-entity-search />

    <div
      ref="listElement"
      class="relative grow overflow-auto border-t border-gray-200"
    >
      <table
        v-if="entitiesList.length > 0"
        class="w-full border-collapse "
      >
        <thead class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
          <tr>
            <th
              v-for="column in tableColumnsWithTypes"
              :key="column.name"
              class="cursor-pointer select-none border-r border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 last:border-r-0 hover:bg-gray-100"
              @click="handleSort(column.name)"
            >
              <div class="flex items-center justify-between">
                {{ column.name }}

                <my-icon
                  v-if="sortField === column.name"
                  :icon="sortDirection === 'desc' ? 'sort-descending' : 'sort-ascending'"
                  class="ml-2 size-3 text-gray-600"
                />
                <my-icon
                  v-else
                  icon="sort-ascending"
                  class="ml-2 size-3 text-gray-400 opacity-0 group-hover:opacity-30"
                />
              </div>
            </th>
            <th class="w-1" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entity in entitiesList"
            :key="entity._id"
            class="border-b border-gray-100 hover:bg-zinc-50"
            :class="{ 'bg-zinc-100 hover:bg-zinc-100': entity._id === route.params.entityId }"
          >
            <td
              v-for="column in tableColumnsWithTypes"
              :key="`${entity._id}-${column.name}`"
              class="max-w-xs border-r border-gray-200 px-3 py-2 text-sm last:border-r-0"
            >
              <layout-entity-table-cell
                :values="entity[column.name] || []"
                :is-name="column.name === 'name'"
                :entity-id="entity._id"
                :fallback-id="entity._id"
              />
            </td>

            <td class="max-w-xs border-r border-gray-200 px-3 py-2 text-sm last:border-r-0">
              <n-popover
                class="max-w-sm"
                placement="left"
              >
                <template #trigger>
                  <my-icon
                    v-if="getValue(entity._sharing) === 'public'"
                    class="mt-1.5 text-gray-500 hover:text-orange-600"
                    icon="sharing-public"
                  />
                  <my-icon
                    v-else-if="getValue(entity._sharing) === 'domain'"
                    class="mt-1.5 text-gray-500 hover:text-yellow-600"
                    icon="sharing-domain"
                  />
                  <my-icon
                    v-else
                    class="mt-1.5 text-gray-500 hover:text-green-600"
                    icon="sharing-private"
                  />
                </template>

                <span
                  v-if="getValue(entity._sharing) === 'public'"
                  class="text-sm text-orange-600"
                >{{ t('sharingPublic') }}</span>
                <span
                  v-else-if="getValue(entity._sharing) === 'domain'"
                  class="text-sm text-yellow-600"
                >{{ t('sharingDomain') }}</span>
                <span
                  v-else
                  class="text-sm text-green-600"
                >{{ t('sharingPrivate') }}</span>
              </n-popover>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="isLoading && !isLoadingOnScroll"
      class="flex size-full items-center justify-center"
    >
      <n-spin />
    </div>

    <layout-entity-list-loading
      v-if="entitiesCount !== 0"
      class="max-w-96"
      :is-loading="isLoadingOnScroll"
      :loaded-count="entitiesList.length"
      :total-count="entitiesCount"
    />

    <div
      v-if="entitiesCount === 0"
      class="flex size-full items-center justify-center"
    >
      <n-empty :description="t('noResults')" />
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    search: Search Entity
    advancedSearch: Advanced Search
    noResults: No entities found
    sharingPrivate: Private entity
    sharingDomain: Anyone with account can see
    sharingPublic: Public entity
  et:
    search: Otsi objekti
    advancedSearch: Täpsem otsing
    noResults: Objekte ei leitud
    sharingPrivate: Privaatne objekt
    sharingDomain: Kõik kasutajad näevad seda objekti
    sharingPublic: Avalik objekt
</i18n>
