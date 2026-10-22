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
const { isMobile } = useIsMobile()

const isOverflowing = ref(true)
const isAnimated = ref(false)

let resizeObserver = null

// Labels fit when the items, with every label at full width, fit in the toolbar; a collapsed label still reports its full width as scrollWidth.
function updateOverflow () {
  const element = toolbarRef.value

  if (!element) return

  const items = [...element.children]
  const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0
  const itemsWidth = items.reduce((sum, item) => sum + item.getBoundingClientRect().width, 0) + gap * Math.max(items.length - 1, 0)
  const hiddenWidth = [...element.querySelectorAll('[data-button-label]')].reduce((sum, label) => sum + label.scrollWidth - label.clientWidth, 0)

  isOverflowing.value = itemsWidth + hiddenWidth > element.clientWidth
}

const checkOverflow = useDebounceFn(updateOverflow, 100)

const menuStore = useMenuStore()
const { activeMenu } = storeToRefs(menuStore)

const addByActiveMenuOptions = computed(() => activeMenu.value?.addFrom || [])

watch(right, () => {
  checkOverflow()
})

onMounted(() => {
  if (!toolbarRef.value) return

  updateOverflow()

  // The first measured state shows without animation; transitions start once that frame is painted.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    isAnimated.value = true
  }))

  resizeObserver = new ResizeObserver(checkOverflow)
  resizeObserver.observe(toolbarRef.value)
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
        '**:transition-none!': !isAnimated,
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
            :input-props="{ 'aria-label': t('search'), 'type': 'search' }"
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
                <button
                  aria-keyshortcuts="Meta+K Control+K"
                  class="cursor-pointer text-xs font-medium whitespace-nowrap text-slate-600 dark:text-slate-300"
                  type="button"
                  :aria-label="t('commandPalette')"
                  @click="paletteStore.open(searchText)"
                >
                  {{ paletteKeyHint }}
                </button>
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
        <!-- An auto margin instead of grow keeps this item at its content width, so the overflow check can sum the items. -->
        <div class="mr-auto">
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
