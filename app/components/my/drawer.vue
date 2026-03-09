<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NDrawer, NDrawerContent, NSpin } from 'naive-ui'

const { t } = useI18n()
const { width: windowWidth } = useWindowSize()
const isMobile = computed(() => windowWidth.value < 768)

const show = defineModel('show', { type: Boolean, default: false })
const width = defineModel('width', { type: Number, default: window.innerWidth / 2 })
const isLoading = defineModel('isLoading', { type: Boolean, default: false })

const drawerMinWidth = computed(() => isMobile.value ? windowWidth.value : 500)
const drawerMaxWidth = computed(() => isMobile.value ? windowWidth.value : 1000)
const drawerDefaultWidth = computed(() => isMobile.value ? windowWidth.value : width.value)

const emit = defineEmits(['close'])

defineProps({
  title: { type: String, default: '' }
})

const closeRef = ref()
useFocus(closeRef, { initialValue: true })

function close () {
  show.value = false
  emit('close')
}

onKeyStroke('Escape', close)
</script>

<template>
  <n-drawer
    v-model:show="show"
    placement="right"
    :resizable="!isMobile"
    :close-on-esc="false"
    :default-width="drawerDefaultWidth"
    :mask-closable="false"
    :max-width="drawerMaxWidth"
    :min-width="drawerMinWidth"
    @mask-click="close"
  >
    <n-drawer-content
      body-content-class="!p-0"
      header-class="w-full"
    >
      <template #header>
        <div class="flex w-full items-center justify-between">
          <h2 class="overflow-hidden truncate whitespace-nowrap">
            {{ title }}
          </h2>

          <my-icon
            class="cursor-pointer hover:bg-slate-100"
            icon="close"
            @click="close"
          />
        </div>
      </template>

      <n-spin
        :show="isLoading"
        class="h-full max-h-full max-w-full"
        content-class="size-full"
      >
        <div class="size-full">
          <slot />
        </div>
      </n-spin>

      <template #footer>
        <div class="flex w-full items-center justify-between">
          <slot name="footer" />

          <div class="grow" />

          <my-button
            ref="closeRef"
            :label="t('close')"
            @click="close"
          />
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style>
.n-drawer-header__main {
  @apply w-full;
}

@media (max-width: 767px) {
  .n-drawer-header {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
  .n-drawer-footer {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
}
</style>

<i18n lang="yaml">
  en:
    close: Close
  et:
    close: Sulge
</i18n>
