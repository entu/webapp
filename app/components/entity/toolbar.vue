<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButtonGroup } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: null },
  typeId: { type: String, default: null },
  typeName: { type: String, default: null },
  right: { type: Object, default: () => {} }
})

const { path, query } = useRoute()
const { t } = useI18n()

const menuStore = useMenueStore()
const { activeMenu, addFromEntities } = storeToRefs(menuStore)

const addByActiveMenuOptions = computed(() => activeMenu.value?.addFrom || [])

const addChildOptions = computed(() => {
  let result = addFromEntities.value?.filter((x) => !['entity', 'menu'].includes(props.typeName) && x.addFrom.includes(props.entityId))

  if (result.length === 0) {
    result = addFromEntities.value?.filter((x) => x.addFrom.includes(props.typeId))
  }

  result.sort((a, b) => a.label.localeCompare(b.label))

  return result
})
</script>

<template>
  <div class="mx-2 flex gap-2 print:hidden">
    <div class="grow">
      <entity-toolbar-add :options="addByActiveMenuOptions" />
    </div>

    <n-button-group
      v-if="entityId"
      class="flex items-center"
    >
      <entity-toolbar-add
        v-if="right.expander"
        icon="expand"
        is-child
        :options="addChildOptions"
      />

      <my-button
        v-if="right.editor"
        icon="edit"
        :label="t('edit')"
        @click="navigateTo({ path, query, hash: `#edit` }, { replace: true })"
      />

      <my-button
        v-if="right.editor"
        disabled
        icon="copy"
        :label="t('duplicate')"
        @click="navigateTo({ path, query, hash: `#duplicate` }, { replace: true })"
      />

      <my-button
        v-if="right.editor"
        icon="tree-view"
        :label="t('parents')"
        @click="navigateTo({ path, query, hash: `#parents` }, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="user-multiple"
        :label="t('rights')"
        @click="navigateTo({ path, query, hash: `#rights` }, { replace: true })"
      />
    </n-button-group>

    <my-button
      v-if="right.viewer"
      icon="debug"
      :bg="false"
      @click="navigateTo({ path, query, hash: `#debug` }, { replace: true })"
    />
  </div>
</template>

<i18n lang="yaml">
  en:
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: Rights
  et:
    edit: Muuda
    duplicate: Dubleeri
    parents: Kuuluvus
    rights: Õigused
</i18n>
