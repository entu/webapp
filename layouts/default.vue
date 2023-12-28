<script setup>
import { NLayout, NLayoutSider, useLoadingBar } from 'naive-ui'

const route = useRoute()
const loadingBar = useLoadingBar()
const requests = useRequestCounter()

const { accountId } = useAccount()
const { menuCollapsed } = useUser()

const isQuery = computed(() => Object.keys(route.query).length > 0)
const loading = computed(() => requests.value > 0)

watch(loading, (value) => {
  if (value) {
    loadingBar.start()
  } else {
    loadingBar.finish()
  }
})
</script>

<template>
  <n-layout
    class="size-full"
    has-sider
  >
    <n-layout-sider
      show-trigger="bar"
      collapse-mode="width"
      :class="{ 'm-2 mr-0 rounded-md': !menuCollapsed }"
      :collapsed-width="60"
      :collapsed="menuCollapsed"
      @collapse="menuCollapsed = true"
      @expand="menuCollapsed = false"
    >
      <layout-side-menu :collapsed="menuCollapsed" />
    </n-layout-sider>

    <div
      v-if="accountId && isQuery"
      :class="{ 'py-2': !menuCollapsed }"
    >
      <layout-entity-list />
    </div>

    <div
      class="py-2 grow overflow-y-auto"
      :class="{ 'pl-4': !isQuery }"
    >
      <slot />
    </div>
  </n-layout>
</template>
