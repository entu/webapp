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

const addChildOptions = computed(() => getAddChildOptions(addFromEntities.value, entityId.value, typeId.value, typeName.value))
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
        :tooltip="showLabel ? undefined : t('edit')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#edit` }, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="copy"
        :label="showLabel ? t('duplicate') : undefined"
        :tooltip="showLabel ? undefined : t('duplicate')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#duplicate` }, { replace: true })"
      />

      <my-button
        v-if="right.editor"
        icon="folder-parent"
        :label="showLabel ? t('parents') : undefined"
        :tooltip="showLabel ? undefined : t('parents')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#parents` }, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="user-multiple"
        :label="showLabel ? t('rights') : undefined"
        :tooltip="showLabel ? undefined : t('rights')"
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
        :tooltip="showLabel ? undefined : t('history')"
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
