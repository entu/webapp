<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButton, NDrawer, NDrawerContent } from 'naive-ui'

const { t } = useI18n()

const width = defineModel('width', { type: Number, default: window.innerWidth / 2 })

const emit = defineEmits(['close'])

defineProps({
  title: { type: String, default: '' }
})
</script>

<template>
  <n-drawer
    :show="true"
    placement="right"
    resizable
    :close-on-esc="false"
    :default-width="width"
    :mask-closable="false"
    @mask-click="emit('close')"
  >
    <n-drawer-content
      header-class="w-full"
      body-content-class="pt-0"
    >
      <template #header>
        <div class="w-full flex justify-between items-center">
          <h2>{{ title }}</h2>

          <icon-close
            class="size-5 cursor-pointer hover:bg-slate-100"
            @click="emit('close')"
          />
        </div>
      </template>

      <slot />

      <template #footer>
        <n-button
          tertiary
          @click="emit('close')"
        >
          {{ t('close') }}
        </n-button>
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
