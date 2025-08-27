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

const { y: listElementScroll } = useScroll(listElement)

const debouncedScroll = useDebounceFn(async () => {
  await navigateTo({ path: `/${accountId.value}/${entitiesList.value.at(scrollIdx.value)._id}`, query: route.query })
}, 300)

const isQuery = computed(() => Object.keys(route.query).length > 0)

const tableColumns = computed(() => {
  if (!entitiesList.value.length) return ['name']

  const allKeys = entitiesList.value
    .flatMap((entity) => Object.keys(entity))
    .filter((key) => !key.startsWith('_'))

  return ['name', ...new Set(allKeys.filter((key) => key !== 'name'))]
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

watch(() => route.query, () => {
  if (locationSearch.value === window.location.search) return

  skip.value = 0
  entitiesCount.value = null
  entitiesList.value = []
  locationSearch.value = window.location.search

  getEntities(true)
}, { deep: true, immediate: true })

watch(() => route.params.entityId, (value) => {
  scrollIdx.value = entitiesList.value.findIndex((x) => x._id === value) || 0
})

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
              v-for="column in tableColumns"
              :key="column"
              class="border-r border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700 last:border-r-0"
            >
              {{ column }}
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
              v-for="column in tableColumns"
              :key="`${entity._id}-${column}`"
              class="max-w-xs border-r border-gray-200 px-3 py-2 text-sm last:border-r-0"
            >
              <layout-entity-table-cell
                :values="entity[column] || []"
                :is-name="column === 'name'"
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
