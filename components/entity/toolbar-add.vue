<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButton, NPopover } from 'naive-ui'

defineProps({
  options: { type: Array, required: true },
  isChild: { type: Boolean, default: false }
})

const { t } = useI18n()
const route = useRoute()
</script>

<template>
  <n-button
    v-if="options.length === 1"
    tertiary
    @click="navigateTo({ path: route.path, query: route.query, hash: `#add-${options.at(0).value}`})"
  >
    <template #icon>
      <icon-add class="h-7 w-7" />
    </template>
    {{ t(isChild ? 'addOneChild' : 'addOne', { type: options.at(0).label.toLowerCase() }) }}
  </n-button>

  <n-popover
    v-if="options.length > 1"
    content-style="padding:0;border:none"
    footer-style="padding:0;border:none"
  >
    <template #trigger>
      <n-button tertiary>
        <template #icon>
          <icon-add class="h-7 w-7" />
        </template>
        {{ t(isChild ? 'addChild' : 'add') }}
      </n-button>
    </template>

    <div class="w-full flex flex-col">
      <nuxt-link
        v-for="o in options"
        :key="o.value"
        class="py-2 px-4 hover:bg-gray-50 cursor-pointer"
        :to="{ path: route.path, query: route.query, hash: `#add-${o.value}`}"
      >
        {{ o.label.toLowerCase() }}
      </nuxt-link>
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
