<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButtonGroup } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: null },
  typeId: { type: String, default: null },
  typeName: { type: String, default: null },
  right: { type: Object, default: () => {} }
})

const { path, query } = useRoute()
const { t } = useI18n()

const toolbarRef = ref()
const { width: windowWidth } = useWindowSize()

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

const menuStore = useMenueStore()
const { activeMenu, addFromEntities } = storeToRefs(menuStore)

const addByActiveMenuOptions = computed(() => activeMenu.value?.addFrom || [])

const addChildOptions = computed(() => {
  let result = addFromEntities.value?.filter((x) => !['entity', 'menu'].includes(props.typeName) && x.addFrom.includes(props.entityId))

  if (result.length === 0) {
    result = addFromEntities.value?.filter((x) => x.addFrom.includes(props.typeId))
  }

  result.sort((a, b) => a.label.localeCompare(b.label))

  return result
})

watch(windowWidth, (newWidth) => {
  if (isOverflowing.value && newWidth <= minWidthForLabels.value) return

  checkOverflow()
})

watch(() => props.right, () => {
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
    class="mx-2 flex gap-2 print:hidden"
    :class="{ 'opacity-0': isMeasuring }"
  >
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

      <my-button
        v-if="right.editor"
        icon="edit"
        :label="isOverflowing ? undefined : t('edit')"
        @click="navigateTo({ path, query, hash: `#edit` }, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="copy"
        :label="isOverflowing ? undefined : t('duplicate')"
        @click="navigateTo({ path, query, hash: `#duplicate` }, { replace: true })"
      />

      <my-button
        v-if="right.editor"
        icon="tree-view"
        :label="isOverflowing ? undefined : t('parents')"
        @click="navigateTo({ path, query, hash: `#parents` }, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="user-multiple"
        :label="isOverflowing ? undefined : t('rights')"
        @click="navigateTo({ path, query, hash: `#rights` }, { replace: true })"
      />
    </n-button-group>
  </div>
</template>

<i18n lang="yaml">
  en:
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: Rights
  et:
    edit: Muuda
    duplicate: Dubleeri
    parents: Kuuluvus
    rights: Õigused
</i18n>
