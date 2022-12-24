<script setup>
import { NLayout, NLayoutSider, useLoadingBar } from 'naive-ui'
import { useMainStore } from '~/stores/main'

const loadingBar = useLoadingBar()
const mainStore = useMainStore()
const { loading, menuCollapsed } = storeToRefs(mainStore)

watch(() => loading.value, (value) => {
  if (value) {
    loadingBar.start()
  } else {
    loadingBar.finish()
  }
})
</script>

<template>
  <n-layout
    class="h-full w-full"
    has-sider
  >
    <n-layout-sider
      class="bg-[#1E434C]"
      show-trigger="bar"
      collapse-mode="width"
      :class="{ 'm-2 rounded-md': !menuCollapsed }"
      :collapsed-width="60"
      :collapsed="menuCollapsed"
      @collapse="menuCollapsed = true"
      @expand="menuCollapsed = false"
    >
      <left-menu :collapsed="menuCollapsed" />
    </n-layout-sider>
    <slot />
  </n-layout>
</template>
