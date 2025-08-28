<script setup>
import { useAnalytics } from '~/utils/analytics'

const { t } = useI18n()
const route = useRoute()

const showSearchModal = ref(false)
const searchText = ref(route.query.q || '')

watch(() => route.query.q, (newValue) => {
  searchText.value = newValue || ''
})

watchDebounced(searchText, async (value) => {
  const routeConfig = { ...route, query: { ...route.query, q: value } }

  if (!value) delete routeConfig.query.q

  await navigateTo(routeConfig, { replace: true })
}, { debounce: 500, maxWait: 5000 })

function openAdvancedSearch () {
  useAnalytics('click_open_search')

  showSearchModal.value = true
}

function handleAdvancedSearch (query) {
  navigateTo({ path: route.path, query })
  showSearchModal.value = false
}
</script>

<template>
  <div class="ml-3 flex h-12 items-center gap-3">
    <label
      for="search"
      class="flex h-7 w-8 items-center justify-center"
    >
      <my-icon
        class="text-gray-400"
        icon="search"
      />
    </label>
    <input
      id="search"
      v-model="searchText"
      class="w-full bg-transparent py-3 pr-3 placeholder:italic placeholder:text-gray-400 focus:outline-none"
      :placeholder="t('search')"
    >
    <button
      class="mr-1 flex h-7 w-12 items-center justify-center rounded hover:bg-gray-100"
      :title="t('advancedSearch')"
      @click="openAdvancedSearch()"
    >
      <my-icon
        class="text-gray-600"
        icon="search-advanced"
      />
    </button>
  </div>

  <!-- Advanced Search Modal -->
  <layout-entity-search-modal
    v-model:show="showSearchModal"
    @search="handleAdvancedSearch"
  />
</template>
