<script setup>
import { NInputGroup, NInput, NPopover } from 'naive-ui'

const route = useRoute()
const { t } = useI18n()
const { listWidth, showTable, userId } = useUser()
const { right } = useEntity()

const isQuery = computed(() => Object.keys(route.query).length > 0)

function toggleView () {
  showTable.value = !showTable.value
  useAnalytics('toggle_view', { table: showTable.value })
}

const showSearchModal = ref(false)
const searchText = ref(route.query.q || '')

watch(() => route.query.q, (newValue) => {
  if ((newValue || '') !== searchText.value) {
    searchText.value = newValue || ''
  }
})

watchDebounced(searchText, async (value) => {
  useAnalytics('search', { q: value })

  const query = { ...route.query }

  if (value) {
    query.q = value
  }
  else {
    delete query.q
  }

  await navigateTo({ path: route.path, query }, { replace: true })
}, { debounce: 500, maxWait: 5000 })

const chatStore = useChatStore()

function toggleChat () {
  useAnalytics('toggle_chat', { open: !chatStore.isOpen })
  chatStore.isOpen = !chatStore.isOpen
}

function openAdvancedSearch () {
  useAnalytics('show_search')
  showSearchModal.value = true
}

function handleAdvancedSearch (advancedQuery) {
  navigateTo({ path: route.path, query: advancedQuery })
  showSearchModal.value = false
}

const toolbarRef = useTemplateRef('toolbarRef')
const { width: windowWidth } = useWindowSize()
const { isMobile } = useIsMobile()

const isOverflowing = ref(true)
const minWidthForLabels = ref(0)
const isMeasuring = ref(true)

let resizeObserver = null

const checkOverflow = useDebounceFn(() => {
  if (!toolbarRef.value) return

  isMeasuring.value = true

  const element = toolbarRef.value

  if (isOverflowing.value) {
    isOverflowing.value = false

    nextTick(() => {
      if (!toolbarRef.value) return

      const fitsWithLabels = toolbarRef.value.scrollWidth <= toolbarRef.value.clientWidth

      if (fitsWithLabels) {
        // Labels fit! Store this width as minimum needed
        minWidthForLabels.value = windowWidth.value
      }
      else {
        // Labels don't fit - go back to small buttons
        isOverflowing.value = true
        minWidthForLabels.value = windowWidth.value + 100
      }
    })
  }
  else {
    // Currently showing labels - check if they still fit
    const stillFits = element.scrollWidth <= element.clientWidth

    if (stillFits) {
      // Labels still fit - update our minimum width requirement
      minWidthForLabels.value = Math.min(minWidthForLabels.value, windowWidth.value)
    }
    else {
      // Labels no longer fit - switch to small buttons
      isOverflowing.value = true
      minWidthForLabels.value = windowWidth.value + 50
    }
  }

  isMeasuring.value = false
}, 200)

const menuStore = useMenuStore()
const { activeMenu } = storeToRefs(menuStore)

const addByActiveMenuOptions = computed(() => activeMenu.value?.addFrom || [])

const searchWidth = computed(() => !showTable.value && !isMobile.value ? { width: `${listWidth.value * 100}%` } : undefined)

watch(windowWidth, (newWidth) => {
  if (isOverflowing.value && newWidth <= minWidthForLabels.value) return

  checkOverflow()
})

watch(right, () => {
  checkOverflow()
})

watch(listWidth, () => {
  checkOverflow()
})

onMounted(() => {
  if (!toolbarRef.value) return

  resizeObserver = new ResizeObserver(checkOverflow)
  resizeObserver.observe(toolbarRef.value)

  nextTick(checkOverflow)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    ref="toolbarRef"
    class="flex items-center gap-2 print:hidden"
    :class="{ 'opacity-0': isMeasuring }"
  >
    <div
      v-if="userId && !(isMobile && route.params.entityId)"
      class="w-64 pr-2"
      :style="searchWidth"
    >
      <n-input-group>
        <n-input
          v-model:value="searchText"
          round
          :placeholder="t('search')"
        >
          <template #prefix>
            <my-icon
              class="text-gray-400"
              icon="search"
            />
          </template>

          <template #suffix>
            <n-popover>
              <template #trigger>
                <my-icon
                  class="cursor-pointer"
                  icon="search-advanced"
                  @click="openAdvancedSearch()"
                />
              </template>
              <div class="text-sm">
                {{ t('advancedSearch') }}
              </div>
            </n-popover>
          </template>
        </n-input>
      </n-input-group>

      <!-- Advanced Search Modal -->
      <entity-search-modal
        v-if="userId"
        v-model:show="showSearchModal"
        @search="handleAdvancedSearch"
      />
    </div>

    <div class="grow">
      <entity-toolbar-add
        :options="addByActiveMenuOptions"
        :show-label="!isOverflowing"
      />
    </div>

    <entity-actions
      v-if="!showTable"
      :show-label="!isOverflowing"
    />

    <my-button
      v-if="!isMobile && userId && isQuery && !route.params.entityId"
      circle
      :icon="showTable ? 'list' : 'table'"
      :title="showTable ? t('listView') : t('tableView')"
      @click="toggleView()"
    />

    <my-button
      v-if="userId"
      circle
      class="bg-[#1E434C]! text-white! hover:bg-[#162E35]!"
      icon="sparkles"
      :title="t('entuAi')"
      @click="toggleChat()"
    />
  </div>
</template>

<style scoped>
.n-input {
  @apply border-0;
  @apply bg-transparent!
}
</style>

<i18n lang="yaml">
  en:
    search: Search Entity
    advancedSearch: Advanced Search
    listView: List view
    tableView: Table view
    entuAi: Entu AI
  et:
    search: Otsi objekti
    advancedSearch: Täpsem otsing
    listView: Loendivaade
    tableView: Tabelivaade
    entuAi: Entu AI
</i18n>
