<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NPopover } from 'naive-ui'

const { userId } = useUser()

const props = defineProps({
  options: { type: Array, required: true },
  isChild: { type: Boolean, default: false },
  icon: { type: String, default: 'add' }
})

const { t } = useI18n()
const route = useRoute()

const label = computed(() => {
  if (props.isChild && props.options.length === 1) {
    return t('addOneChild', { type: props.options.at(0).label?.toLowerCase() })
  } else if (props.isChild && props.options.length > 1) {
    return t('addChild')
  } else if (!props.isChild && props.options.length === 1) {
    return t('addOne', { type: props.options.at(0).label?.toLowerCase() })
  } else {
    return t('add')
  }
})
</script>

<template>
  <my-button
    v-if="userId && options.length === 1"
    :icon="icon"
    :label="label"
    @click="navigateTo({ path: route.path, query: route.query, hash: `#${isChild ? 'child' : 'add'}-${options.at(0).value}`}, { replace: true })"
  />

  <n-popover
    v-if="userId && options.length > 1"
    content-style="padding:0;border:none"
    footer-style="padding:0;border:none"
  >
    <template #trigger>
      <my-button
        :icon="icon"
        :label="label"
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
    add: New ...
    addOne: New {type}
    addChild: Add ...
    addOneChild: Add {type}
  et:
    add: Uus ...
    addOne: Uus {type}
    addChild: Lisa ...
    addOneChild: Lisa {type}
</i18n>
