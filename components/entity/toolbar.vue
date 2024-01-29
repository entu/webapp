<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButton, NButtonGroup } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: null },
  typeId: { type: String, default: null },
  right: { type: String, default: null }
})

const { t } = useI18n()
const route = useRoute()

const addChilds = ref([])
const addDefaults = ref([])

const addDefaultOptions = computed(() => addDefaults.value.map(x => ({
  value: x._id,
  label: getValue(x.label) || getValue(x.name)
})).sort((a, b) => a.label.localeCompare(b.label)))

const addChildOptions = computed(() => ['owner', 'editor', 'expander'].includes(props.right) && addChilds.value.length > 0
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

      <n-button
        v-if="['owner', 'editor'].includes(right)"
        tertiary
        @click="navigateTo({ path: route.path, query: route.query, hash: `#edit`}, { replace: true })"
      >
        <template #icon>
          <icon-edit class="size-5" />
        </template>
        {{ t('edit') }}
      </n-button>

      <n-button
        v-if="['owner', 'editor'].includes(right)"
        tertiary
        disabled
        @click="navigateTo({ path: route.path, query: route.query, hash: `#duplicate`}, { replace: true })"
      >
        <template #icon>
          <icon-copy class="size-5" />
        </template>
        {{ t('duplicate') }}
      </n-button>

      <n-button
        v-if="['owner', 'editor'].includes(right)"
        tertiary
        disabled
        @click="navigateTo({ path: route.path, query: route.query, hash: `#parents`}, { replace: true })"
      >
        <template #icon>
          <icon-tree-view class="size-5" />
        </template>
        {{ t('parents') }}
      </n-button>

      <n-button
        v-if="['owner'].includes(right)"
        tertiary
        @click="navigateTo({ path: route.path, query: route.query, hash: `#rights`}, { replace: true })"
      >
        <template #icon>
          <icon-user-multiple class="size-5" />
        </template>
        {{ t('rights') }}
      </n-button>
    </n-button-group>

    <n-button
      v-if="['owner', 'editor', 'expander', 'viewer'].includes(right)"
      quaternary
      @click="navigateTo({ path: route.path, query: route.query, hash: `#debug`}, { replace: true })"
    >
      <template #icon>
        <icon-debug class="size-5" />
      </template>
    </n-button>
  </div>
</template>

<i18n lang="yaml">
  en:
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: User rights
  et:
    edit: Muuda
    duplicate: Dubleeri
    parents: Kuuluvus
    rights: Õigused
</i18n>
