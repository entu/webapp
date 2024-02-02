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

const addChilds = ref([])
const addDefaults = ref([])

const addDefaultOptions = computed(() => addDefaults.value.map(x => ({
  value: x._id,
  label: getValue(x.label) || getValue(x.name)
})).sort((a, b) => a.label.localeCompare(b.label)))

const addChildOptions = computed(() => props.right.expander && addChilds.value.length > 0
  ? addChilds.value.map(x => ({
    value: x._id,
    label: getValue(x.label) || getValue(x.name)
  })).sort((a, b) => a.label.localeCompare(b.label))
  : []
)

async function loadAddDefaults () {
  const { entities: menuEntities } = await apiGetEntities({
    '_type.string': 'menu',
    'query.string': window.location.search.substring(1),
    props: '_id',
    limit: 1
  })

  if (menuEntities.length === 0) return

  const { entities } = await apiGetEntities({
    '_type.string': 'entity',
    'add_from.reference': menuEntities.at(0)._id,
    props: [
      'name',
      'label'
    ].join(',')
  })

  addDefaults.value = entities
}

async function loadAddChilds () {
  if (props.entityId) {
    const { entities } = await apiGetEntities({
      'add_from.reference': props.entityId,
      '_type.string.ne': 'entity',
      props: [
        'name',
        'label'
      ].join(',')
    })

    addChilds.value = [...addChilds.value, ...entities.filter(x => !addChilds.value.some(y => y._id === x._id))]
  }

  if (props.typeId) {
    const { entities } = await apiGetEntities({
      'add_from.reference': props.typeId,
      props: [
        'name',
        'label'
      ].join(',')
    })

    addChilds.value = [...addChilds.value, ...entities.filter(x => !addChilds.value.some(y => y._id === x._id))]
  }
}

watch(() => route.query, () => loadAddDefaults(), { deep: true, immediate: true })
watch(() => props, () => loadAddChilds(), { deep: true, immediate: true })
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
