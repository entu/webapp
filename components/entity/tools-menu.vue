<script setup>
import { NButton, NPopover } from 'naive-ui'

const props = defineProps({
  account: { type: String, required: true },
  entityId: { type: String, required: true },
  right: { type: String, default: null },
  typeId: { type: String, required: true }
})

const { t } = useI18n()

const addChilds = ref([])

const addOptions = computed(() => addChilds.value.map(x => ({
  value: x._id,
  label: getValue(x.label) || getValue(x.name)
})).sort((a, b) => a.label.localeCompare(b.label)))

onMounted(async () => {
  const { entities } = await apiGetEntities({
    'add_from.reference': props.entityId,
    props: 'name,label'
  })

  const { entities: types } = await apiGetEntities({
    'add_from.reference': props.typeId,
    props: 'name,label'
  })

  addChilds.value = [...entities, ...types.filter(x => !entities.some(y => y._id === x._id))]
})
</script>

<template>
  <div class="h-12 mx-2 flex items-center justify-end border-b border-gray-300">
    <n-popover
      v-if="['owner', 'editor', 'expander'].includes(right) && addOptions.length > 0"
      content-style="padding:0"
      header-style="padding:0"
    >
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <icon-add class="h-7 w-7" />
          </template>
        </n-button>
      </template>

      <template #header>
        <div class="py-2 px-4 font-bold">
          {{ t('addUnderThis') }}
        </div>
      </template>

      <div
        class="w-full flex flex-col"
        vertical
      >
        <nuxt-link
          v-for="child in addOptions"
          :key="child.value"
          class="py-2 px-4 hover:bg-gray-50 cursor-pointer"
          :to="{ path: `/${account}/${entityId}/add/${child.value}` }"
        >
          {{ child.label }}
        </nuxt-link>
      </div>
    </n-popover>

    <n-popover v-if="['owner', 'editor'].includes(right)">
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <icon-edit class="h-5 w-5" />
          </template>
        </n-button>
      </template>

      {{ t('edit') }}
    </n-popover>

    <n-popover>
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <icon-copy class="h-5 w-5" />
          </template>
        </n-button>
      </template>

      {{ t('duplicate') }}
    </n-popover>

    <n-popover>
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <icon-tree-view class="h-5 w-5" />
          </template>
        </n-button>
      </template>

      {{ t('parents') }}
    </n-popover>

    <n-popover>
      <template #trigger>
        <n-button quaternary>
          <template #icon>
            <icon-user-multiple class="h-5 w-5" />
          </template>
        </n-button>
      </template>

      {{ t('rights') }}
    </n-popover>
  </div>
</template>

<i18n lang="yaml">
  en:
    addUnderThis: Add children
    edit: Edit
    duplicate: Duplicate
    parents: Parents
    rights: User rights
  et:
    addUnderThis: Lisa alamobjekt
    edit: Muuda
    duplicate: Dubleeri
    parents: Peamised
    rights: Õigused
</i18n>
