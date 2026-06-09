<script setup>
import { NButtonGroup } from 'naive-ui'

defineProps({
  showLabel: {
    type: Boolean,
    default: true
  }
})

const route = useRoute()
const { t } = useI18n()
const { entityId, right, typeId, typeName } = useEntity()
const menuStore = useMenuStore()
const { addFromEntities } = storeToRefs(menuStore)

const addChildOptions = computed(() => {
  let result = addFromEntities.value?.filter((x) => !['entity', 'menu'].includes(typeName.value) && x.addFrom.includes(entityId.value))

  if (result.length === 0) {
    result = addFromEntities.value?.filter((x) => x.addFrom.includes(typeId.value))
  }

  result.sort((a, b) => a.label.localeCompare(b.label))

  return result
})
</script>

<template>
  <div class="flex items-center gap-2">
    <n-button-group
      v-if="entityId"
      class="flex items-center"
    >
      <entity-toolbar-add
        v-if="right.expander"
        icon="expand"
        is-child
        :options="addChildOptions"
        :show-label="showLabel"
      />
    </n-button-group>

    <n-button-group
      v-if="entityId"
      class="flex items-center"
    >
      <my-button
        v-if="right.editor"
        icon="edit"
        :label="showLabel ? t('edit') : undefined"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#edit` }, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="copy"
        :label="showLabel ? t('duplicate') : undefined"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#duplicate` }, { replace: true })"
      />

      <my-button
        v-if="right.editor"
        icon="tree-view"
        :label="showLabel ? t('parents') : undefined"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#parents` }, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="user-multiple"
        :label="showLabel ? t('rights') : undefined"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#rights` }, { replace: true })"
      />
    </n-button-group>

    <n-button-group
      v-if="entityId"
      class="flex items-center"
    >
      <my-button
        v-if="right.editor"
        icon="history"
        :label="showLabel ? t('history') : undefined"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#history` }, { replace: true })"
      />
    </n-button-group>
  </div>
</template>

<i18n lang="yaml">
  en:
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: Rights
    history: History
  et:
    edit: Muuda
    duplicate: Dubleeri
    parents: Kuuluvus
    rights: Õigused
    history: Ajalugu
</i18n>
