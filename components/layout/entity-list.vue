<script setup>
const { t } = useI18n()
const route = useRoute()
const { accountId } = useAccount()

const listElement = ref(null)
const searchText = ref(route.query.q || '')
const entitiesList = ref([])
const entitiesCount = ref(null)
const limit = ref(Math.ceil(window.innerHeight / 48) + 3)
const skip = ref(0)
const isLoading = ref(false)
const locationSearch = ref(null)
const scrollIdx = ref(0)

const { y: listElementScroll } = useScroll(listElement)

const debouncedScroll = useDebounceFn(async () => {
  await navigateTo({ path: `/${accountId.value}/${entitiesList.value.at(scrollIdx.value)._id}`, query: route.query })
}, 300)

const isQuery = computed(() => Object.keys(route.query).length > 0)

useInfiniteScroll(listElement, () => {
  if (isLoading.value) return
  if (limit.value === 0) return
  if (entitiesCount.value === 0) return

  getEntities()
}, { distance: 150 })

onKeyStroke(['ArrowDown', 'ArrowUp'], (e) => {
  if (route.hash) return
  if (e.code === 'ArrowDown') scrollIdx.value < entitiesList.value.length - 1 && scrollIdx.value++
  if (e.code === 'ArrowUp') scrollIdx.value > 0 && scrollIdx.value--

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
  scrollIdx.value = entitiesList.value.findIndex(x => x._id === value) || 0
})

watchDebounced(searchText, async (value) => {
  const routeConfig = { ...route, query: { ...route.query, q: value } }

  if (!value) delete routeConfig.query.q

  await navigateTo(routeConfig, { replace: true })
}, { debounce: 500, maxWait: 5000 })

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
    props: [
      '_thumbnail',
      'name'
    ],
    limit: limit.value,
    skip: skip.value
  })

  entitiesList.value = [...entitiesList.value, ...entities.map(e => ({ ...e, color: color() }))]
  entitiesCount.value = count
  skip.value += limit.value

  scrollIdx.value = entitiesList.value.findIndex(x => x._id === route.params.entityId) || 0

  isLoading.value = false
}

function color () {
  const colors = ['!bg-amber-200', '!bg-blue-200', '!bg-cyan-200', '!bg-emerald-200', '!bg-fuchsia-200', '!bg-gray-200', '!bg-green-200', '!bg-indigo-200', '!bg-lime-200', '!bg-neutral-200', '!bg-orange-200', '!bg-pink-200', '!bg-purple-200', '!bg-red-200', '!bg-rose-200', '!bg-sky-200', '!bg-slate-200', '!bg-stone-200', '!bg-teal-200', '!bg-violet-200', '!bg-yellow-200', '!bg-zinc-200'
  ]
  const rnd = Math.floor(Math.random() * colors.length)

  return colors[rnd]
}
</script>

<template>
  <div class="h-full flex flex-col border-r border-gray-300">
    <div class="h-12 ml-6 flex items-center gap-3">
      <label
        for="search"
        class="w-8 h-7 flex items-center justify-center"
      >
        <icon-search class="size-5 text-gray-400" />
      </label>
      <input
        id="search"
        v-model="searchText"
        class="w-full py-3 pr-3 bg-transparent placeholder:italic placeholder:text-gray-400 focus:outline-none"
        :placeholder="t('search')"
      >
    </div>

    <div
      ref="listElement"
      class="w-80 max-h-full relative overflow-y-auto"
    >
      <nuxt-link
        v-for="(entity, idx) in entitiesList"
        :key="entity._id"
        class="list-item"
        :class="{
          'font-bold ': idx === scrollIdx,
          'active': entity._id === route.params.entityId
        }"
        :to="{ path: `/${accountId}/${entity._id}`, query: route.query }"
      >
        <img
          v-if="entity._thumbnail"
          :src="entity._thumbnail"
          :class="entity.color"
          class="list-item-img"
        >
        <div
          v-else
          class="list-item-img"
          :class="entity.color"
        >
          {{ `${getValue(entity.name)}`.at(0) }}
        </div>

        <div class="list-item-text">
          {{ getValue(entity.name) }}
        </div>
      </nuxt-link>
    </div>

    <div
      v-if="!isLoading || entitiesCount !== null"
      class="pt-3 pb-1 sticky bottom-0 text-center text-gray-400 italic bg-white"
    >
      {{ t('count', entitiesCount) }}
    </div>
  </div>
</template>

<style scoped>
.list-item {
  @apply h-12 pl-6 pr-3;
  @apply flex items-center gap-3;
  @apply hover:bg-zinc-50;
  @apply hover:border-y border-zinc-50;
}

.list-item-img {
  @apply size-7 rounded-full object-cover;
  @apply flex-none flex items-center justify-center;
  @apply uppercase text-sm text-white font-bold;
}

.list-item-text {
  @apply py-3;
  @apply flex-auto truncate whitespace-nowrap overflow-hidden;
  @apply border-t border-white;
}

.list-item.active {
  @apply bg-zinc-100 hover:bg-zinc-100;
  @apply hover:border-y border-zinc-100;
}

.list-item.active  > .list-item-text {
  @apply !border-white;
}

.list-item:hover + .list-item > .list-item-text {
  @apply !border-zinc-50;
}

.list-item.active + .list-item > .list-item-text {
  @apply !border-zinc-100;
}

.list-item:not(:first-child):not(:hover) > .list-item-text {
  @apply border-zinc-200;
}
</style>

<i18n lang="yaml">
  en:
    search: Search Entity
    count: 'no entities found | {n} entity | {n} entities'
  et:
    search: Otsi objekti
    count: 'objekte ei leitud | {n} objekt | {n} objekti'
</i18n>
