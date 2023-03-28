<script setup>
import { NLayout, NLayoutSider, useLoadingBar } from 'naive-ui'

const route = useRoute()
const loadingBar = useLoadingBar()
const mainStore = useMainStore()
const userStore = useUserStore()
const { loading, menuCollapsed } = storeToRefs(mainStore)
const { _id, account, accounts, authenticated, name } = storeToRefs(userStore)

const isQuery = computed(() => Object.keys(route.query).length > 0)

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
      show-trigger="bar"
      collapse-mode="width"
      :class="{ 'm-2 mr-0 rounded-md': !menuCollapsed }"
      :collapsed-width="60"
      :collapsed="menuCollapsed"
      @collapse="menuCollapsed = true"
      @expand="menuCollapsed = false"
    >
      <layout-side-menu
        :collapsed="menuCollapsed"
        :account="account"
        :accounts="accounts"
        :authenticated="authenticated"
        :user-id="_id"
        :user-name="name"
      />
    </n-layout-sider>

    <div v-if="isQuery" :class="{ 'py-2': !menuCollapsed }">
      <layout-entity-list :account="account" />
    </div>

    <div
      class="py-2 grow overflow-y-auto"
      :class="{ 'pl-4': !isQuery }"
    >
      <slot />
    </div>
  </n-layout>
</template>
