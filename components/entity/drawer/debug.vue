<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { stringify } from 'yaml'
import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/github.css'

import { NCollapse, NCollapseItem } from 'naive-ui'

const { t } = useI18n()

const emit = defineEmits(['close'])

defineProps({
  entity: { type: Object, default: () => ({}) },
  properties: { type: Array, default: () => ([]) },
  rawEntity: { type: Object, default: () => ({}) },
  rawType: { type: Object, default: () => ({}) },
  rawProperties: { type: Array, default: () => ([]) }
})

hljs.registerLanguage('yaml', yaml)
function showYaml (value) {
  return hljs.highlight(stringify(value), { language: 'yaml' }).value
}
</script>

<template>
  <drawer
    :title="t('title')"
    @close="emit('close')"
  >
    <n-collapse class="mt-6">
      <n-collapse-item
        name="entity"
        :title="t('entity')"
      >
        <div
          class="p-2 text-xs whitespace-pre font-mono rounded-md bg-slate-50"
          v-html="showYaml(entity)"
        />
      </n-collapse-item>

      <n-collapse-item
        name="properties"
        :title="t('properties')"
      >
        <div
          class="p-2 text-xs whitespace-pre font-mono rounded-md bg-slate-50"
          v-html="showYaml(properties)"
        />
      </n-collapse-item>

      <n-collapse-item
        name="rawEntity"
        :title="t('rawEntity')"
      >
        <div
          class="p-2 text-xs whitespace-pre font-mono rounded-md bg-slate-50"
          v-html="showYaml(rawEntity)"
        />
      </n-collapse-item>

      <n-collapse-item
        name="rawType"
        :title="t('rawType')"
      >
        <div
          class="p-2 text-xs whitespace-pre font-mono rounded-md bg-slate-50"
          v-html="showYaml(rawType)"
        />
      </n-collapse-item>

      <n-collapse-item
        name="rawProperties"
        :title="t('rawPropertyTypes')"
      >
        <div
          v-for="p in rawProperties"
          :key="p._id"
          class="mb-5 p-2 text-xs whitespace-pre font-mono rounded-md bg-slate-50"
          v-html="showYaml(p)"
        />
      </n-collapse-item>
    </n-collapse>
  </drawer>
</template>

<i18n lang="yaml">
  en:
    title: API Debug
  et:
    title: API Tõrkeotsing
</i18n>
