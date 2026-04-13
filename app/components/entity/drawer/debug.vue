<script setup>
import { stringify } from 'yaml'
import hljs from 'highlight.js/lib/core'
import yaml from 'highlight.js/lib/languages/yaml'
import 'highlight.js/styles/github.css'

import { NCollapse, NCollapseItem } from 'naive-ui'

const { t } = useI18n()

const emit = defineEmits(['close'])

const show = defineModel('show', { type: Boolean, default: false })

defineProps({
  entity: { type: Object, default: () => ({}) },
  properties: { type: Array, default: () => ([]) },
  rawEntity: { type: Object, default: () => ({}) }
})

hljs.registerLanguage('yaml', yaml)
function showYaml (value) {
  return hljs.highlight(stringify(value), { language: 'yaml' }).value
}
</script>

<template>
  <my-drawer
    v-model:show="show"
    :title="t('title')"
    @close="emit('close')"
  >
    <n-collapse class="px-3 py-4 md:px-6">
      <n-collapse-item
        name="entity"
        :title="t('entity')"
      >
        <div
          class="rounded-md bg-slate-50 p-2 font-mono text-xs whitespace-pre"
          v-html="showYaml(entity)"
        />
      </n-collapse-item>

      <n-collapse-item
        name="properties"
        :title="t('properties')"
      >
        <div
          class="rounded-md bg-slate-50 p-2 font-mono text-xs whitespace-pre"
          v-html="showYaml(properties)"
        />
      </n-collapse-item>

      <n-collapse-item
        name="rawEntity"
        :title="t('rawEntity')"
      >
        <div
          class="rounded-md bg-slate-50 p-2 font-mono text-xs whitespace-pre"
          v-html="showYaml(rawEntity)"
        />
      </n-collapse-item>
    </n-collapse>
  </my-drawer>
</template>

<i18n lang="yaml">
  en:
    title: API Debug
    entity: Entity
    properties: Properties
    rawEntity: Raw Entity
    rawType: Raw Type
    rawPropertyTypes: Raw Property Types

  et:
    title: API Tõrkeotsing
    entity: Objekt
    properties: Parameetrid
    rawEntity: Toorobjekt
    rawType: Toorobjektitüüp
    rawPropertyTypes: Toorparameetritüübid
</i18n>
