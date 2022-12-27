<script setup>
import { Search as SearchIcon } from '@vicons/carbon'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { account } = storeToRefs(userStore)

const el = ref(null)
const searchText = ref(route.query.q || '')
const entitiesList = ref([])
const entitiesCount = ref()
const limit = ref(Math.ceil(window.innerHeight / 50))
const skip = ref(0)
const isLoading = ref(false)
const locationSearch = ref(null)

const isQuery = computed(() => Object.keys(route.query).length > 0)

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
    router.replace({ query: { ...route.query, q: searchText.value } })
  } else {
    const newQuery = { ...route.query }
    delete newQuery.q

    router.replace({ query: newQuery })
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

onMounted(getEntities)
</script>

<template>
  <div
    class="h-full flex flex-col border-r border-gray-300"
  >
    <div class="mx-3 flex items-center gap-2 border-b border-gray-300">
      <label
        for="search"
        class="w-7 h-7 flex items-center justify-center"
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
      class="w-80 max-h-full relative overflow-y-auto"
    >
      <nuxt-link
        v-for="(entity, idx) in entitiesList"
        :key="entity._id"
        class="h-12 pl-6 pr-3 flex items-center gap-3 hover:bg-gray-50"
        :class="{ 'font-bold bg-zinc-100 hover:bg-zinc-100': entity._id === route.params.entityId }"
        :to="{ path: `/${account}/${entity._id}`, query: route.query }"
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
          class="py-3 h-12 flex-auto truncate whitespace-nowrap overflow-hidden border-b first-of-type:border-gray-200"
        >
          {{ getValue(entity.name) }}
        </div>
      </nuxt-link>
    </div>

    <div class="pt-3 pb-1 sticky bottom-0 text-center text-sm text-gray-500 italic bg-white">
      {{ entitiesCount }} {{ entitiesCount === 1 ? 'entity' : 'entities' }}
    </div>
  </div>
</template>
