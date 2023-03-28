<script setup>
import { NButton, NPopover } from 'naive-ui'

const props = defineProps({
  account: { type: String, required: true },
  entityId: { type: String, default: null },
  right: { type: String, default: null },
  typeId: { type: String, default: null }
})

const { t } = useI18n()
const route = useRoute()
const location = useBrowserLocation()

const addChilds = ref([])
const addDefaults = ref([])

const addChildOptions = computed(() => {
  const result = []

  if (['owner', 'editor', 'expander'].includes(props.right) && addChilds.value.length > 0) {
    result.push({
      title: t('addUnderThis'),
      options: addChilds.value.map(x => ({
        value: x._id,
        label: getValue(x.label) || getValue(x.name)
      })).sort((a, b) => a.label.localeCompare(b.label))
    })
  }

  if (addDefaults.value.length > 0) {
    result.push({
      title: t('addNew'),
      options: addDefaults.value.map(x => ({
        value: x._id,
        label: getValue(x.label) || getValue(x.name)
      })).sort((a, b) => a.label.localeCompare(b.label))
    })
  }

  return result
})

async function loadAddDefaults () {
  const { entities: menuEntities } = await apiGetEntities({
    '_type.string': 'menu',
    'query.string': location.value.search.substring(1),
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

watch(() => location.value.search, loadAddDefaults, { deep: true })

onMounted(async () => {
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

  loadAddDefaults()
})
</script>

<template>
  <div
    v-if="entityId || addChildOptions.length > 0"
    class="h-12 mx-2 flex items-center justify-end border-b border-gray-300"
  >
    <n-popover
      v-if="addChildOptions.length > 0"
      content-style="padding:0;border:none"
      footer-style="padding:0;border:none"
    >
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <icon-add class="h-7 w-7" />
          </template>
          {{ t('add') }}
        </n-button>
      </template>

      <div
        v-for="addGroup in addChildOptions"
        :key="addGroup.title"
        class="w-full flex flex-col border-b last:border-b-0"
        vertical
      >
        <div class="py-2 px-4 font-bold text-[#1E434C]">
          {{ addGroup.title }}
        </div>
        <nuxt-link
          v-for="child in addGroup.options"
          :key="child.value"
          class="py-2 px-4 hover:bg-gray-50 cursor-pointer"
          :to="{ path: route.path, query:route.query, hash: `#add-${child.value}`}"
        >
          {{ child.label }}
        </nuxt-link>
      </div>

      <template #footer>
        <div />
      </template>
    </n-popover>

    <n-button
      quaternary
      @click="navigateTo({ path: route.path, query:route.query, hash: `#edit`})"
    >
      <template #icon>
        <icon-edit class="h-5 w-5" />
      </template>
      {{ t('edit') }}
    </n-button>

    <n-button
      quaternary
      @click="navigateTo({ path: route.path, query:route.query, hash: `#duplicate`})"
    >
      <template #icon>
        <icon-copy class="h-5 w-5" />
      </template>
      {{ t('duplicate') }}
    </n-button>

    <n-button
      quaternary
      @click="navigateTo({ path: route.path, query:route.query, hash: `#parents`})"
    >
      <template #icon>
        <icon-tree-view class="h-5 w-5" />
      </template>
      {{ t('parents') }}
    </n-button>

    <n-button
      quaternary
      @click="navigateTo({ path: route.path, query:route.query, hash: `#rights`})"
    >
      <template #icon>
        <icon-user-multiple class="h-5 w-5" />
      </template>
      {{ t('rights') }}
    </n-button>
  </div>
</template>

<i18n lang="yaml">
  en:
    add: Add
    addNew: Add new object
    addUnderThis: Add child object
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: User rights
  et:
    add: Lisa
    addNew: Lisa uus objekt
    addUnderThis: Lisa alamobjekt
    edit: Muuda
    duplicate: Dubleeri
    parents: Kuuluvus
    rights: Õigused
</i18n>
