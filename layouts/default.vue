<script setup>
import { NLayout, NLayoutSider, NSplit } from 'naive-ui'

const route = useRoute()

const { accountId } = useAccount()
const { menuCollapsed, listWidth } = useUser()

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
      class="flex-grow overflow-y-auto"
    >
      <n-split
        v-model:size="listWidth"
        direction="horizontal"
        :max="0.50"
        :min="0.20"
        :pane1-class="!menuCollapsed ? 'py-2' : ''"
        :pane2-class="!isQuery ? 'pl-4 py-2 grow overflow-y-auto' : 'py-2 grow overflow-y-auto'"
      >
        <template #1>
          <layout-entity-list />
        </template>

        <template #resize-trigger>
          <div
            class="h-full"
            :class="menuCollapsed ? 'py-0' : 'py-2'"
          >
            <div class="h-full w-0.5 hover:bg-gray-400 bg-gray-300" />
          </div>
        </template>

        <template #2>
          <slot />
        </template>
      </n-split>
    </div>

    <div
      v-else
      class="py-2 grow overflow-y-auto"
      :class="{ 'pl-4': !isQuery }"
    >
      <slot />
    </div>
  </n-layout>
</template>
