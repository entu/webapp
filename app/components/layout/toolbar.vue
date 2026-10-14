<script setup>
import { NInputGroup, NInput } from 'naive-ui'

// In the list/detail split the toolbar is shown in two parts: the search above the list, the buttons above the detail.
defineProps({
  gradient: { type: String, default: undefined },
  onColor: { type: Boolean, default: false },
  part: { type: String, default: 'all', validator: (value) => ['all', 'search', 'actions'].includes(value) }
})

const route = useRoute()
const { t } = useI18n()
const { showTable, userId } = useUser()
const { right } = useEntity()

const isQuery = computed(() => Object.keys(route.query).length > 0)

function toggleView () {
  showTable.value = !showTable.value
  useAnalytics('toggle_view', { table: showTable.value })
}

// Shared with the ⌘K palette so its Advanced Search command can open the modal.
const paletteStore = usePaletteStore()
const { showSearchModal } = storeToRefs(paletteStore)

const paletteKeyHint = paletteShortcutLabel()

const searchText = ref(route.query.q || '')

watch(() => route.query.q, (newValue) => {
  if ((newValue || '') !== searchText.value) {
    searchText.value = newValue || ''
  }
})

watchDebounced(searchText, async (value) => {
  // The split shows two toolbar parts, so skip the echo of a search the other part already applied.
  if ((value || '') === (route.query.q || '')) return

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
  if (chatStore.isOpen) {
    useAnalytics('show_ai')
  }

  chatStore.isOpen = !chatStore.isOpen
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

watch(windowWidth, (newWidth) => {
  if (isOverflowing.value && newWidth <= minWidthForLabels.value) return

  checkOverflow()
})

watch(right, () => {
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
    class="bg-fixed p-2 print:hidden"
    :style="{ backgroundImage: gradient }"
  >
    <div
      ref="toolbarRef"
      class="flex items-center gap-2"
      :class="{
        'opacity-0': isMeasuring,
        'on-color': gradient || onColor,
      }"
    >
      <div
        v-if="part !== 'actions' && userId && !(isMobile && route.params.entityId)"
        class="shrink-0"
        :class="{
          'w-64 pr-2': part === 'all',
          'w-full': part === 'search',
        }"
      >
        <n-input-group>
          <n-input
            v-model:value="searchText"
            round
            :placeholder="t('search')"
          >
            <template #prefix>
              <my-icon
                class="text-slate-400 dark:text-slate-500"
                icon="search"
              />
            </template>

            <template #suffix>
              <my-tooltip
                v-if="!isMobile"
                :text="t('commandPalette')"
              >
                <span
                  class="cursor-pointer text-xs font-medium whitespace-nowrap text-slate-600 dark:text-slate-300"
                  @click="paletteStore.open(searchText)"
                >{{ paletteKeyHint }}</span>
              </my-tooltip>
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

      <template v-if="part !== 'search'">
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
          :label="showTable ? t('listView') : t('tableView')"
          @click="toggleView()"
        />

        <my-button
          v-if="userId"
          circle
          icon="sparkles"
          :label="t('entuAi')"
          @click="toggleChat()"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.n-input {
  @apply border-0;
}
</style>

<i18n lang="yaml">
  en:
    search: Search Entity
    listView: List view
    tableView: Table view
    entuAi: Entu AI
    commandPalette: Command Palette
  et:
    search: Otsi objekti
    listView: Loendivaade
    tableView: Tabelivaade
    entuAi: Entu AI
    commandPalette: Käsupalett
</i18n>
