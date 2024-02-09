<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButtonGroup } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: null },
  typeId: { type: String, default: null },
  right: { type: Object, default: () => {} }
})

const { t } = useI18n()
const route = useRoute()

const menuStore = useMenueStore()
const { activeMenu, addFromEntities } = storeToRefs(menuStore)

const addChilds = ref([])

const addDefaultOptions = computed(() => activeMenu.value?.addFrom || [])

const addChildOptions = computed(() => props.right.expander && addChilds.value.length > 0
  ? addChilds.value.sort((a, b) => a.label.localeCompare(b.label))
  : []
)

watch([() => props.typeId, addFromEntities], async () => {
  if (props.entityId || !props.typeId) return

  addChilds.value = [
    ...addChilds.value,
    ...addFromEntities.value?.filter(x => x.addFrom.includes(props.typeId) && !addChilds.value.some(y => y.value === x.value))
  ]
}, { immediate: true })

watch(() => props.entityId, async (value) => {
  if (!value) return

  const { entities } = await apiGetEntities({
    'add_from.reference': props.entityId,
    props: [
      'name',
      'label'
    ].join(',')
  })

  addChilds.value = [
    ...entities?.map(x => ({
      value: x._id,
      label: getValue(x.label) || getValue(x.name)
    }))
  ]
}, { immediate: true })
</script>

<template>
  <div class="mx-2 flex gap-2">
    <div class="grow">
      <entity-toolbar-add :options="addDefaultOptions" />
    </div>

    <n-button-group
      v-if="entityId"
      class="flex items-center"
    >
      <entity-toolbar-add
        :is-child="true"
        :options="addChildOptions"
      />

      <my-button
        v-if="right.editor"
        icon="edit"
        :label="t('edit')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#edit`}, { replace: true })"
      />

      <my-button
        v-if="right.editor"
        disabled
        icon="copy"
        :label="t('duplicate')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#duplicate`}, { replace: true })"
      />

      <my-button
        v-if="right.editor"
        icon="tree-view"
        :label="t('parents')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#parents`}, { replace: true })"
      />

      <my-button
        v-if="right.owner"
        icon="user-multiple"
        :label="t('rights')"
        @click="navigateTo({ path: route.path, query: route.query, hash: `#rights`}, { replace: true })"
      />
    </n-button-group>

    <my-button
      v-if="right.viewer"
      icon="debug"
      :bg="false"
      @click="navigateTo({ path: route.path, query: route.query, hash: `#debug`}, { replace: true })"
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
