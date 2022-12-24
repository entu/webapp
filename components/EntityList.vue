<script setup>
import { Search as SearchIcon } from '@vicons/carbon'

const route = useRoute()
const router = useRouter()

const el = ref(null)
const searchText = ref(route.query.q || '')
const entitiesList = ref([])
const entitiesCount = ref()
const limit = ref(Math.ceil(window.innerHeight / 50))
const skip = ref(0)
const isLoading = ref(false)
const locationSearch = ref(null)

const isQuery = computed(() => Object.keys(route.query).length > 0)

onMounted(getEntities)

useInfiniteScroll(el, getEntities, { distance: 100 })

watch(() => route.query, () => {
  if (locationSearch.value === location.search) return

  skip.value = 0
  entitiesList.value = []
  locationSearch.value = location.search

  getEntities(true)
})

watchDebounced(searchText, () => {
  if (searchText.value) {
    router.replace({ path: route.path, query: { ...route.query, q: searchText.value } })
  } else {
    const newQuery = { ...route.query }
    delete newQuery.q

    router.replace({ path: route.path, query: newQuery })
  }
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
      'name.string'
    ],
    limit: limit.value,
    skip: skip.value
  })

  entitiesList.value = [...entitiesList.value, ...entities.map(e => ({ ...e, color: color() }))]
  entitiesCount.value = count
  skip.value += limit.value

  isLoading.value = false
}

function color () {
  const colors = ['bg-amber-50', 'bg-blue-50', 'bg-cyan-50', 'bg-emerald-50', 'bg-fuchsia-50', 'bg-gray-50', 'bg-green-50', 'bg-indigo-50', 'bg-lime-50', 'bg-neutral-50', 'bg-orange-50', 'bg-pink-50', 'bg-purple-50', 'bg-red-50', 'bg-rose-50', 'bg-sky-50', 'bg-slate-50', 'bg-stone-50', 'bg-teal-50', 'bg-violet-50', 'bg-yellow-50', 'bg-zinc-50'
  ]
  const rnd = Math.floor(Math.random() * colors.length)

  return colors[rnd]
}
</script>

<template>
  <div
    class="w-80 h-full flex flex-col"
  >
    <div class="w-full flex items-center border-b border-gray-300">
      <label
        for="search"
        class="p-3"
      >
        <search-icon class="h-5 w-5 text-gray-400" />
      </label>
      <input
        id="search"
        v-model="searchText"
        placeholder="Search Entity"
        class="w-full py-3 pr-3 bg-transparent placeholder:italic placeholder:text-gray-400 focus:outline-none"
      >
    </div>

    <div
      ref="el"
      class="h-full relative overflow-y-auto border-r border-gray-300"
    >
      <div class="py-2 sticky top-0 text-center text-sm text-gray-500 italic bg-white">
        {{ entitiesCount }} {{ entitiesCount === 1 ? 'entity' : 'entities' }}
      </div>

      <router-link
        v-for="(entity, idx) in entitiesList"
        :key="entity._id"
        class="h-12 px-3 flex items-center hover:bg-gray-50"
        :class="{ 'font-bold bg-zinc-100 hover:bg-zinc-100': false}"
        :to="{ path: `${route.path}/${entity._id}`, query: route.query }"
      >
        <img
          v-if="entity._thumbnail"
          :src="entity._thumbnail"
          :class="entity.color"
          class="w-7 h-7 flex-none object-cover rounded-full"
        >
        <div
          v-else
          class="w-7 h-7 flex-none rounded-full "
          :class="entity.color"
        />
        <div
          :class="{ 'border-t': idx === 0 }"
          class="py-3 ml-3 h-12 flex-auto truncate whitespace-nowrap overflow-hidden border-b first-of-type:border-gray-200"
        >
          {{ getValue(entity.name) }}
        </div>
      </router-link>
    </div>
  </div>
</template>
