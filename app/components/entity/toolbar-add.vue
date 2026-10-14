<script setup>
import { NPopover } from 'naive-ui'

const { userId } = useUser()

const props = defineProps({
  options: { type: Array, required: true },
  isChild: { type: Boolean, default: false },
  icon: { type: String, default: 'add' },
  showLabel: { type: Boolean, default: false }
})

const route = useRoute()
const { t } = useI18n()

const label = computed(() => {
  if (props.isChild && props.options.length === 1) {
    return t('addOneChild', { type: props.options.at(0).label?.toLowerCase() })
  }
  else if (props.isChild && props.options.length > 1) {
    return t('addChild')
  }
  else if (!props.isChild && props.options.length === 1) {
    return t('addOne', { type: props.options.at(0).label?.toLowerCase() })
  }
  else {
    return t('add')
  }
})
</script>

<template>
  <my-button
    v-if="userId && options.length === 1"
    :hide-label="!showLabel"
    :icon="icon"
    :label="label"
    @click="navigateTo({ path: route.path, query: route.query, hash: `#${isChild ? 'child' : 'add'}-${options.at(0).value}` }, { replace: true })"
  />

  <n-popover
    v-if="userId && options.length > 1"
    content-style="padding:0;border:none"
    footer-style="padding:0;border:none"
    trigger="click"
  >
    <!-- A real element as trigger, since an icon-only button's tooltip root is a fragment the popover can't bind to -->
    <template #trigger>
      <span class="inline-flex">
        <my-button
          aria-haspopup="true"
          :aria-expanded="isMenuOpen"
          :hide-label="!showLabel"
          :icon="icon"
          :label="label"
        />
      </span>
    </template>

    <div class="flex w-full flex-col">
      <div class="px-4 pt-3 pb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
        {{ isChild ? t('addChildTitle') : t('addTitle') }}
      </div>
      <div
        v-for="o in options"
        :key="o.value"
        class="cursor-pointer px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#${isChild ? 'child' : 'add'}-${o.value}` }, { replace: true })"
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
    addTitle: New
    addChildTitle: Add
  et:
    add: Uus ...
    addOne: Uus {type}
    addChild: Lisa ...
    addOneChild: Lisa {type}
    addTitle: Uus
    addChildTitle: Lisa
</i18n>
