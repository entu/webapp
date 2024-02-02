<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NDrawer, NDrawerContent, NSpin } from 'naive-ui'

const { t } = useI18n()

const width = defineModel('width', { type: Number, default: window.innerWidth / 2 })
const isLoading = defineModel('isLoading', { type: Boolean, default: false })

const emit = defineEmits(['close'])

defineProps({
  title: { type: String, default: '' }
})

const closeRef = ref()
useFocus(closeRef, { initialValue: true })

onKeyStroke('Escape', () => emit('close'))
</script>

<template>
  <n-drawer
    placement="right"
    resizable
    :close-on-esc="false"
    :default-width="width"
    :mask-closable="false"
    :show="true"
    @mask-click="emit('close')"
  >
    <n-drawer-content
      body-content-class="!py-0"
      header-class="w-full"
    >
      <template #header>
        <div class="w-full flex justify-between items-center">
          <h2 class="truncate whitespace-nowrap overflow-hidden">
            {{ title }}
          </h2>

          <my-icon
            class="cursor-pointer hover:bg-slate-100"
            icon="close"
            @click="emit('close')"
          />
        </div>
      </template>

      <n-spin :show="isLoading" class="max-w-full max-h-full h-full">
        <div class="py-4">
          <slot />
        </div>
      </n-spin>

      <template #footer>
        <div class="w-full flex justify-between items-center">
          <slot name="footer" />

          <div class="grow" />

          <my-button
            ref="closeRef"
            :label="t('close')"
            @click="emit('close')"
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

<style>
.n-drawer-header__main {
  @apply w-full;
}
</style>
