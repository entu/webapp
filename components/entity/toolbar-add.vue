<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NPopover } from 'naive-ui'

defineProps({
  options: { type: Array, required: true },
  isChild: { type: Boolean, default: false }
})

const { t } = useI18n()
const route = useRoute()
</script>

<template>
  <my-button
    v-if="options.length === 1"
    icon="add"
    :label="t(isChild ? 'addOneChild' : 'addOne', { type: options.at(0).label.toLowerCase() })"
    @click="navigateTo({ path: route.path, query: route.query, hash: `#${isChild ? 'child' : 'add'}-${options.at(0).value}`}, { replace: true })"
  />

  <n-popover
    v-if="options.length > 1"
    content-style="padding:0;border:none"
    footer-style="padding:0;border:none"
  >
    <template #trigger>
      <my-button
        icon="add"
        :label="t(isChild ? 'addChild' : 'add')"
      />
    </template>

    <div class="w-full flex flex-col">
      <div
        v-for="o in options"
        :key="o.value"
        class="py-2 px-4 hover:bg-gray-50 cursor-pointer"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#${isChild ? 'child' : 'add'}-${o.value}`}, { replace: true })"
      >
        {{ o.label.toLowerCase() }}
      </div>
    </div>

    <template #footer>
      <div />
    </template>
  </n-popover>
</template>

<i18n lang="yaml">
  en:
    add: New
    addChild: Child ...
    addOne: New {type}
    addOneChild: Child {type}
  et:
    add: Uus
    addChild: Alamobjekt ...
    addOne: Uus {type}
    addOneChild: Alamobjekt {type}
</i18n>
