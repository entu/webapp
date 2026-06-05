<script setup>
import { NInputGroup, NButtonGroup, NInput, useThemeVars, NPopover } from 'naive-ui'
import { useAnalytics } from '~/utils/analytics'

const themeVars = useThemeVars()

const route = useRoute()
const { t } = useI18n()
const { listWidth, userId } = useUser()
const { entityId, right, typeId, typeName } = useEntity()

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
const isMobile = computed(() => windowWidth.value < 768)

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
const { activeMenu, addFromEntities } = storeToRefs(menuStore)

const addByActiveMenuOptions = computed(() => activeMenu.value?.addFrom || [])

const addChildOptions = computed(() => {
  let result = addFromEntities.value?.filter((x) => !['entity', 'menu'].includes(typeName.value) && x.addFrom.includes(entityId.value))

  if (result.length === 0) {
    result = addFromEntities.value?.filter((x) => x.addFrom.includes(typeId.value))
  }

  result.sort((a, b) => a.label.localeCompare(b.label))

  return result
})

const searchWidth = computed(() => {
  if (isMobile.value) return
  if (listWidth.value > 0.3) return { width: 300 }

  return { width: `${listWidth.value * 100}%` }
})

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
    class="flex items-center gap-2 print:hidden "
    :class="{ 'opacity-0': isMeasuring }"
  >
    <div
      v-if="userId"
      class="w-full pr-2"
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
      <layout-entity-search-modal
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

    <n-button-group
      v-if="entityId"
      class="flex items-center"
    >
      <entity-toolbar-add
        v-if="right.expander"
        icon="expand"
        is-child
        :options="addChildOptions"
        :show-label="!isOverflowing"
      />
    </n-button-group>

    <n-button-group
      v-if="entityId"
      class="flex items-center"
    >
      <my-button
        v-if="right.editor"
        icon="edit"
        :label="isOverflowing ? undefined : t('edit')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#edit` }, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="copy"
        :label="isOverflowing ? undefined : t('duplicate')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#duplicate` }, { replace: true })"
      />

      <my-button
        v-if="right.editor"
        icon="tree-view"
        :label="isOverflowing ? undefined : t('parents')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#parents` }, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="user-multiple"
        :label="isOverflowing ? undefined : t('rights')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#rights` }, { replace: true })"
      />
    </n-button-group>

    <n-button-group
      v-if="entityId"
      class="flex items-center"
    >
      <my-button
        v-if="right.editor"
        icon="history"
        :label="isOverflowing ? undefined : t('history')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#history` }, { replace: true })"
      />
    </n-button-group>
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
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: Rights
    history: History
  et:
    search: Otsi objekti
    advancedSearch: Täpsem otsing
    edit: Muuda
    duplicate: Dubleeri
    parents: Kuuluvus
    rights: Õigused
    history: Ajalugu
</i18n>
