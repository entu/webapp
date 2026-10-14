<script setup>
import { NSelect, NTab, NTabs } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, required: true },
  narrow: { type: Boolean, default: false }
})

const { t } = useI18n()
const { tablePageSize } = useUser()

const rawChilds = ref([])
const rawReferences = ref([])
const selectedKey = ref()
const page = ref(1)
const total = ref(0)

const groups = computed(() => [
  ...rawChilds.value.map((x) => ({ ...x, key: `child-${x._id}`, type: 'child', referenceField: '_parent.reference' })),
  ...rawReferences.value.map((x) => ({ ...x, key: `reference-${x._id}`, type: 'reference', referenceField: '_reference.reference' }))
].sort((a, b) => `${a.type} - ${a.label}`.localeCompare(`${b.type} - ${b.label}`)))

const selected = computed(() => groups.value.find((x) => x.key === selectedKey.value) || groups.value.at(0))
const pages = computed(() => Math.max(1, Math.ceil(total.value / tablePageSize.value)))
const pageSizeOptions = computed(() => [10, 25, 100, 250].map((x) => ({ label: t('pageSize', { n: x }), value: x })))

// Switching the type starts its table from the first page.
function onTabChange (key) {
  selectedKey.value = key
  page.value = 1
  total.value = 0
}

// Returns the entity types (with label and count) of the entities matching the filter.
async function loadTypeCounts (filter) {
  const { entities } = await apiGetEntities({ ...filter, group: '_type.reference', props: '_type' })

  const types = await Promise.all(entities.map(async (x) => {
    const typeId = getValue(x._type, 'reference')

    if (!typeId) return

    const type = await apiGetEntity(typeId, ['label_plural', 'label', 'name'])

    return {
      _id: type._id,
      label: getValue(type.label_plural) || getValue(type.label) || getValue(type.name),
      count: x._count
    }
  }))

  return types.filter(Boolean)
}

onMounted(async () => {
  [rawChilds.value, rawReferences.value] = await Promise.all([
    loadTypeCounts({ '_parent.reference': props.entityId }),
    loadTypeCounts({ '_reference.reference': props.entityId, '_reference.property_type.ne': '_parent' })
  ])
})
</script>

<template>
  <div v-if="selected">
    <n-tabs
      class="mb-2 [&_.n-tabs-nav]:flex-wrap [&_.n-tabs-nav]:justify-between [&_.n-tabs-nav]:gap-y-2 [&_.n-tabs-nav\_\_suffix]:ml-auto [&_.n-tabs-rail]:max-w-full [&_.n-tabs-rail]:overflow-x-auto [&_.n-tabs-tab]:px-4!"
      type="segment"
      :class="{ '[&_.n-tabs-rail]:w-fit! [&_.n-tabs-tab-wrapper]:flex-none!': !narrow }"
      :theme-overrides="{ tabBorderRadius: '9999px' }"
      :value="selected.key"
      @update:value="onTabChange($event)"
    >
      <n-tab
        v-for="group in groups"
        :key="group.key"
        :name="group.key"
      >
        {{ group.label }}
        <span class="ml-1.5 text-slate-400 dark:text-slate-500">{{ group.count }}</span>
      </n-tab>

      <template #suffix>
        <div
          v-if="total > 10"
          class="flex items-center gap-2"
        >
          <my-button
            hide-label
            icon="arrow-left"
            :bg="false"
            :disabled="page <= 1"
            :label="t('previousPage')"
            @click="page--"
          />
          <span class="text-sm whitespace-nowrap text-slate-600 tabular-nums dark:text-slate-300">
            {{ page }} / {{ pages }}
          </span>
          <my-button
            hide-label
            icon="arrow-right"
            :bg="false"
            :disabled="page >= pages"
            :label="t('nextPage')"
            @click="page++"
          />
          <n-select
            v-model:value="tablePageSize"
            class="w-24"
            :consistent-menu-width="false"
            :options="pageSizeOptions"
          />
        </div>
      </template>
    </n-tabs>

    <entity-child-table
      :key="selected.key"
      v-model:page="page"
      v-model:total="total"
      class="w-full"
      :entity-id="entityId"
      :page-size="tablePageSize"
      :reference-field="selected.referenceField"
      :type-id="selected._id"
    />
  </div>
</template>

<i18n lang="yaml">
  en:
    pageSize: '{n} / page'
    previousPage: Previous Page
    nextPage: Next Page
  et:
    pageSize: '{n} / lk'
    previousPage: Eelmine lehekülg
    nextPage: Järgmine lehekülg
</i18n>
