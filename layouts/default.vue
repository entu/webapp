<script setup>
import { NLayout, NLayoutSider } from 'naive-ui'

const route = useRoute()

const { accountId } = useAccount()
const { menuCollapsed } = useUser()

const isQuery = computed(() => Object.keys(route.query).length > 0)

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
