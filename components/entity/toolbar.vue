<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButton, NButtonGroup } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: null },
  right: { type: String, default: null },
  typeId: { type: String, default: null }
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
    props: '_id'
  })

  if (menuEntities.length === 0) return

  const { entities } = await apiGetEntities({
    '_type.string': 'entity',
    'add_from.reference': menuEntities[0]._id,
    props: 'name,label'
  })

  addDefaults.value = entities
}

watch(() => route.query, loadAddDefaults, { deep: true })

onMounted(async () => {
  loadAddDefaults()

  if (props.entityId) {
    const { entities } = await apiGetEntities({
      'add_from.reference': props.entityId,
      props: 'name,label'
    })

    addChilds.value = [...addChilds.value, ...entities.filter(x => !addChilds.value.some(y => y._id === x._id))]
  }

  if (props.typeId) {
    const { entities } = await apiGetEntities({
      'add_from.reference': props.typeId,
      props: 'name,label'
    })

    addChilds.value = [...addChilds.value, ...entities.filter(x => !addChilds.value.some(y => y._id === x._id))]
  }
})
</script>

<template>
  <div class="mx-2 flex gap-2 justify-end">
    <entity-toolbar-add :options="addDefaultOptions" />

    <n-button-group
      v-if="entityId"
      class="flex items-center justify-end float-right"
    >
      <entity-toolbar-add
        :is-child="true"
        :options="addChildOptions"
      />

      <n-button
        v-if="['owner', 'editor'].includes(right)"
        tertiary
        @click="navigateTo({ ...route, hash: `#edit`})"
      >
        <template #icon>
          <icon-edit class="h-5 w-5" />
        </template>
        {{ t('edit') }}
      </n-button>

      <n-button
        v-if="entityId"
        tertiary
        @click="navigateTo({ ...route, hash: `#duplicate`})"
      >
        <template #icon>
          <icon-copy class="h-5 w-5" />
        </template>
        {{ t('duplicate') }}
      </n-button>

      <n-button
        v-if="entityId"
        tertiary
        @click="navigateTo({ ...route, hash: `#parents`})"
      >
        <template #icon>
          <icon-tree-view class="h-5 w-5" />
        </template>
        {{ t('parents') }}
      </n-button>

      <n-button
        v-if="entityId"
        tertiary
        @click="navigateTo({ ...route, hash: `#rights`})"
      >
        <template #icon>
          <icon-user-multiple class="h-5 w-5" />
        </template>
        {{ t('rights') }}
      </n-button>
    </n-button-group>
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