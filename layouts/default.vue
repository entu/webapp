<script setup>
import { NLayout, NLayoutSider, NSplit } from 'naive-ui'

const route = useRoute()

const { accountId } = useAccount()
const { menuCollapsed, listWidth } = useUser()

const siderRef = ref()
const isHovered = useElementHover(siderRef, { delayEnter: 200, delayLeave: 600 })

const isQuery = computed(() => Object.keys(route.query).length > 0)

</script>

<template>
  <n-layout
    class="size-full"
    has-sider
  >
    <n-layout-sider
      ref="siderRef"
      collapse-mode="width"
      collapsed-trigger-class="!top-7.5 !text-white !bg-[#1E434C] !shaddow-none !border-white"
      trigger-class="!top-5 !-left-1 !text-white !opacity-80 !bg-transparent !shaddow-none !border-transparent hover:!border-white"
      :class="{ 'm-2 mr-0 rounded-md': !menuCollapsed }"
      :collapsed="menuCollapsed"
      :collapsed-width="60"
      :show-trigger="!menuCollapsed || isHovered ? 'arrow-circle' : undefined"
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
        pane1-class="print:hidden"
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
            class="h-full print:hidden"
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
