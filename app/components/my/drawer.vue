<script setup>
import { NDrawer, NDrawerContent, NSpin } from 'naive-ui'

const { t } = useI18n()
const { width: windowWidth } = useWindowSize()
const { isMobile } = useIsMobile()

const show = defineModel('show', { type: Boolean, default: false })
const width = defineModel('width', { type: Number, default: window.innerWidth / 2 })
const isLoading = defineModel('isLoading', { type: Boolean, default: false })

const drawerMinWidth = computed(() => isMobile.value ? windowWidth.value : 500)
const drawerMaxWidth = computed(() => isMobile.value ? windowWidth.value : 1000)
const drawerDefaultWidth = computed(() => isMobile.value ? windowWidth.value : width.value)

const emit = defineEmits(['close'])

defineProps({
  title: { type: String, default: '' },
  headerStyle: { type: Object, default: undefined }
})

useModalDepth(show)

function close () {
  show.value = false
  isLoading.value = false
  emit('close')
}

function onUpdateWidth (value) {
  if (!isMobile.value) {
    width.value = value
  }
}

onKeyStroke('Escape', close)
</script>

<template>
  <n-drawer
    v-model:show="show"
    placement="right"
    :aria-label="title || undefined"
    :close-on-esc="false"
    :default-width="drawerDefaultWidth"
    :mask-closable="false"
    :max-width="drawerMaxWidth"
    :min-width="drawerMinWidth"
    :resizable="!isMobile"
    @mask-click="close"
    @update:width="onUpdateWidth"
  >
    <n-drawer-content
      body-content-class="p-0!"
      footer-class="max-md:px-3!"
      header-class="w-full p-2!"
      :header-style="headerStyle"
    >
      <template #header>
        <div class="flex w-full items-center justify-between gap-2">
          <slot name="header">
            <h2 class="truncate overflow-hidden p-2 whitespace-nowrap">
              {{ title }}
            </h2>
          </slot>
        </div>
      </template>

      <n-spin
        class="h-full max-h-full max-w-full"
        content-class="size-full"
        :show="isLoading"
      >
        <div
          class="size-full"
          :aria-busy="isLoading"
        >
          <slot />
        </div>
      </n-spin>

      <template #footer>
        <div class="flex w-full items-center justify-between">
          <slot name="footer" />

          <div class="grow" />

          <my-button
            :label="t('close')"
            @click="close"
          />
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<i18n lang="yaml">
  en:
    close: Close
  et:
    close: Sulge
</i18n>
