<script setup>
import { NPopover } from 'naive-ui'
import { NuxtLink } from '#components'

const props = defineProps({
  entityId: { type: String, required: true },
  typeId: { type: String, required: true },
  referenceField: { type: String, required: true },
  pageSize: { type: Number, default: 25 }
})

const route = useRoute()
const { locale, d, t } = useI18n()
const { accountId } = useAccount()
const { isMobile } = useIsMobile()

const nameColumn = { name: 'name', label: '', type: 'string', decimals: undefined }

const rawEntities = ref()
const rawColumns = ref([nameColumn])
const sorter = ref()

// Paging state is shared with the parent so the pager can sit on the tab row.
const page = defineModel('page', { type: Number, default: 1 })
const total = defineModel('total', { type: Number, default: 0 })

const visibleColumns = computed(() => isMobile.value ? [nameColumn] : rawColumns.value)

// Tracks the latest fetch so a slow earlier page/sort response can't overwrite
// a newer one (the instance is reused as entityId/typeId change).
let requestId = 0

function toColumn (definition) {
  return {
    name: getValue(definition.name),
    label: getValue(definition.label),
    type: getValue(definition.type),
    decimals: getValue(definition.decimals, 'number')
  }
}

// Columns are the type's properties flagged for tables, else its name property.
async function loadColumns () {
  const fields = ['name', 'label', 'type', 'decimals'].join(',')

  const { entities } = await apiGetEntities({
    '_parent.reference': props.typeId,
    'table._id.exists': true,
    props: fields,
    sort: 'ordinal.number'
  })

  if (entities.length > 0) {
    rawColumns.value = entities.map(toColumn)

    return
  }

  const { entities: nameEntities } = await apiGetEntities({
    '_parent.reference': props.typeId,
    'name.string': 'name',
    props: fields
  })

  rawColumns.value = nameEntities.map(toColumn)
}

// Toggles or switches the sort column, then reloads from the first page.
function onSort (column) {
  sorter.value = {
    column,
    order: sorter.value?.column === column && sorter.value.order === 'ascending' ? 'descending' : 'ascending'
  }

  if (page.value === 1) {
    loadEntities()
  }
  else {
    page.value = 1
  }
}

async function loadEntities () {
  const currentRequest = ++requestId

  if (!sorter.value) {
    sorter.value = {
      column: rawColumns.value.at(0).name,
      order: 'ascending'
    }
  }

  let field = columnType(rawColumns.value.find((c) => c.name === sorter.value.column))

  if (['text', 'reference'].includes(field)) {
    field = 'string'
  }
  if (field === 'counter') {
    field = 'number'
  }

  const { entities, count } = await apiGetEntities({
    [props.referenceField]: props.entityId,
    '_type.reference': props.typeId,
    props: [
      'photo',
      '_sharing',
      '_owner',
      '_editor',
      'name',
      ...rawColumns.value.map((c) => c.name)
    ].join(','),
    sort: `${sorter.value.order === 'descending' ? '-' : ''}${sorter.value.column}.${field}`,
    limit: props.pageSize,
    skip: props.pageSize * (page.value - 1)
  })

  if (currentRequest !== requestId) return

  rawEntities.value = entities
  total.value = count
}

// Formula values hold their result in whichever field fits, so they render by the shape of the value.
function valueType (value, type) {
  if (type !== 'formula') {
    return type
  }

  return ['number', 'boolean', 'datetime', 'date'].find((x) => getValue(value, x) !== undefined) || 'string'
}

// Column type to align and sort by; formula columns take the shape of their first loaded value.
function columnType (column) {
  if (column?.type !== 'formula') {
    return column?.type
  }

  const row = rawEntities.value?.find((x) => x[column.name]?.length)

  return row ? valueType(row[column.name], column.type) : 'string'
}

function renderColumn (value, declaredType, decimals) {
  const type = valueType(value, declaredType)

  if (type === 'number' && getValue(value, 'number') !== undefined) {
    return getValue(value, 'number').toLocaleString(locale.value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  if (type === 'boolean') return

  if (type === 'datetime' && getValue(value, 'datetime')) {
    return d(getValue(value, 'datetime'), 'datetime')
  }

  if (type === 'date' && getValue(value, 'date')) {
    return d(getValue(value, 'date'), 'date')
  }

  if (type === 'reference') {
    return getValue(value) || getValue(value, 'reference')
  }

  if (['text', 'counter'].includes(type)) {
    return getValue(value)
  }

  if (type === 'file') {
    return getValue(value, 'filename')
  }

  return getValue(value, type)
}

watch(page, () => loadEntities())

watch(() => props.pageSize, () => {
  if (page.value === 1) {
    loadEntities()
  }
  else {
    page.value = 1
  }
})

onMounted(async () => {
  await loadColumns()
  await loadEntities()
})
</script>

<template>
  <div class="overflow-auto">
    <table class="w-full table-auto text-sm">
      <thead>
        <tr>
          <th class="w-7" />

          <th
            v-for="column in visibleColumns"
            :key="column.name"
            class="cursor-pointer p-3 text-left hover:bg-slate-50"
            @click="onSort(column.name)"
          >
            <div
              class="flex items-center gap-2"
              :class="{
                'justify-center': columnType(column) === 'boolean',
                'justify-end': columnType(column) === 'number',
              }"
            >
              {{ column.label }}

              <my-icon
                v-if="sorter && sorter.column === column.name"
                :icon="`sort-${sorter.order}`"
              />
            </div>
          </th>
          <th class="w-1" />
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="row in rawEntities"
          :key="row._id"
          class="group border-t border-slate-200 hover:bg-slate-50"
        >
          <td>
            <div class="relative ml-1 size-7">
              <nuxt-link :to="{ path: `/${accountId}/${row._id}`, query: route.query }">
                <entity-avatar
                  class="print-as-is size-7 rounded-full object-cover"
                  :class="nameColor(getValue(row.name), '50')"
                  :entity-id="row._id"
                  :has-photo="!!row.photo?.length"
                >
                  <div
                    class="print-as-is size-7 rounded-full"
                    :class="nameColor(getValue(row.name), '50')"
                  />
                </entity-avatar>
              </nuxt-link>
            </div>
          </td>

          <td
            v-for="column in visibleColumns"
            :key="column.name"
            :class="{ 'text-right': columnType(column) === 'number' }"
          >
            <nuxt-link
              class="flex size-full items-center px-3 py-2"
              :class="{
                'justify-center': columnType(column) === 'boolean',
                'justify-end': columnType(column) === 'number',
              }"
              :to="{ path: `/${accountId}/${row._id}`, query: route.query }"
            >
              {{ renderColumn(row[column.name], column.type, column.decimals) }}

              <span v-if="column.name === 'name' && !renderColumn(row[column.name], column.type, column.decimals)">
                {{ row._id }}
              </span>

              <my-icon
                v-if="valueType(row[column.name], column.type) === 'boolean' && getValue(row[column.name], 'boolean')"
                icon="checkmark"
              />
            </nuxt-link>
          </td>

          <td class="relative pt-1 pr-1">
            <div class="flex items-center justify-end gap-1">
              <n-popover
                v-if="!isMobile"
                class="max-w-sm"
                placement="left"
              >
                <template #trigger>
                  <my-icon
                    v-if="renderColumn(row._sharing, 'string') === 'public'"
                    class="text-slate-500 group-hover:text-orange-600"
                    icon="sharing-public"
                  />
                  <my-icon
                    v-else-if="renderColumn(row._sharing, 'string') === 'domain'"
                    class="text-slate-500 group-hover:text-yellow-600"
                    icon="sharing-domain"
                  />
                  <my-icon
                    v-else
                    class="text-slate-500 group-hover:text-green-600"
                    icon="sharing-private"
                  />
                </template>

                <span
                  v-if="renderColumn(row._sharing, 'string') === 'public'"
                  class="text-sm text-orange-600"
                >{{ t('sharingPublic') }}</span>
                <span
                  v-else-if="renderColumn(row._sharing, 'string') === 'domain'"
                  class="text-sm text-yellow-600"
                >{{ t('sharingDomain') }}</span>
                <span
                  v-else
                  class="text-sm text-green-600"
                >{{ t('sharingPrivate') }}</span>
              </n-popover>
            </div>

            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-transparent pr-1 pl-4 group-hover:bg-slate-50">
              <entity-child-actions
                class="pointer-events-auto"
                :editor="row._editor"
                :entity-id="row._id"
                :owner="row._owner"
                @refresh="loadEntities()"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<i18n lang="yaml">
  en:
    sharingPrivate: Private entity
    sharingDomain: Anyone with account can see
    sharingPublic: Public entity
  et:
    sharingPrivate: Privaatne objekt
    sharingDomain: Kõik kasutajad näevad seda objekti
    sharingPublic: Avalik objekt
</i18n>
