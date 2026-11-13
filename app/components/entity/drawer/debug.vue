<script setup>
import { NCollapse, NCollapseItem } from 'naive-ui'

const { t } = useI18n()

const emit = defineEmits(['close'])

const show = defineModel('show', { type: Boolean, default: false })

defineProps({
  entity: { type: Object, default: () => ({}) },
  properties: { type: Array, default: () => ([]) },
  rawEntity: { type: Object, default: () => ({}) }
})
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
          v-html="highlightYaml(entity)"
          class="rounded-md bg-slate-50 p-2 font-mono text-xs whitespace-pre dark:bg-slate-900"
        />
      </n-collapse-item>

      <n-collapse-item
        name="properties"
        :title="t('properties')"
      >
        <div
          v-html="highlightYaml(properties)"
          class="rounded-md bg-slate-50 p-2 font-mono text-xs whitespace-pre dark:bg-slate-900"
        />
      </n-collapse-item>

      <n-collapse-item
        name="rawEntity"
        :title="t('rawEntity')"
      >
        <div
          v-html="highlightYaml(rawEntity)"
          class="rounded-md bg-slate-50 p-2 font-mono text-xs whitespace-pre dark:bg-slate-900"
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
