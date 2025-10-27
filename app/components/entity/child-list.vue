<script setup>
import { NPagination, NPopover } from 'naive-ui'
import { MyIcon, NuxtLink } from '#components'

const props = defineProps({
  entityId: { type: String, required: true },
  typeId: { type: String, required: true },
  referenceField: { type: String, required: true }
})

const { path, query } = useRoute()
const { locale, d, t } = useI18n()
const { accountId } = useAccount()
const { tablePageSize } = useUser()

const rawEntities = ref()
const rawColumns = ref([{
  name: 'name',
  label: '',
  type: 'string',
  decimals: undefined
}])
const isLoading = ref(false)
const total = ref(0)
const page = ref(1)
const sorter = ref()

async function getTypes () {
  const { entities } = await apiGetEntities({
    '_parent.reference': props.typeId,
    'table._id.exists': true,
    props: [
      'name',
      'label',
      'type',
      'decimals'
    ].join(','),
    sort: 'ordinal.number'
  })

  if (entities.length > 0) {
    rawColumns.value = entities.map((e) => ({
      name: getValue(e.name),
      label: getValue(e.label),
      type: getValue(e.type),
      decimals: getValue(e.decimals, 'number')
    }))
  }
  else {
    const { entities } = await apiGetEntities({
      '_parent.reference': props.typeId,
      'name.string': 'name',
      props: [
        'name',
        'label',
        'type',
        'decimals'
      ].join(',')
    })

    rawColumns.value = entities.map((e) => ({
      name: getValue(e.name),
      label: getValue(e.label),
      type: getValue(e.type),
      decimals: getValue(e.decimals, 'number')
    }))
  }
}

async function getEntities (setPage, setPageSize, setSorter) {
  isLoading.value = true

  if (setPage) {
    page.value = setPage
  }
  if (setPageSize) {
    tablePageSize.value = setPageSize
  }
  if (setSorter) {
    if (sorter.value.column === setSorter) {
      sorter.value = {
        column: setSorter,
        order: sorter.value.order === 'ascending' ? 'descending' : 'ascending'
      }
    }
    else {
      sorter.value = {
        column: setSorter,
        order: 'ascending'
      }
    }
  }
  else if (!sorter.value) {
    sorter.value = {
      column: rawColumns.value.at(0).name,
      order: 'ascending'
    }
  }

  let field = rawColumns.value.find((c) => c.name === sorter.value.column)?.type

  if (['text', 'reference'].includes(field)) {
    field = 'string'
  }

  const { entities, count } = await apiGetEntities({
    [props.referenceField]: props.entityId,
    '_type.reference': props.typeId,
    props: [
      '_thumbnail',
      '_sharing',
      ...rawColumns.value.map((c) => c.name)
    ].join(','),
    sort: `${sorter.value.order === 'descending' ? '-' : ''}${sorter.value.column}.${field}`,
    limit: tablePageSize.value,
    skip: tablePageSize.value * (page.value - 1)
  })

  rawEntities.value = entities
  total.value = count

  isLoading.value = false
}

function color () {
  const colors = ['bg-amber-50', 'bg-blue-50', 'bg-cyan-50', 'bg-emerald-50', 'bg-fuchsia-50', 'bg-gray-50', 'bg-green-50', 'bg-indigo-50', 'bg-lime-50', 'bg-neutral-50', 'bg-orange-50', 'bg-pink-50', 'bg-purple-50', 'bg-red-50', 'bg-rose-50', 'bg-sky-50', 'bg-slate-50', 'bg-stone-50', 'bg-teal-50', 'bg-violet-50', 'bg-yellow-50', 'bg-zinc-50'
  ]
  const rnd = Math.floor(Math.random() * colors.length)

  return colors[rnd]
}

function renderColumn (value, type, decimals) {
  if (type === 'number' && getValue(value, 'number')) {
    return getValue(value, 'number').toLocaleString(locale.value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  if (type === 'boolean' && getValue(value, 'boolean')) {
    return undefined
  }

  if (type === 'datetime' && getValue(value, 'datetime')) {
    return d(getValue(value, 'datetime'), 'datetime')
  }

  if (type === 'date' && getValue(value, 'date')) {
    return d(getValue(value, 'date'), 'date')
  }

  if (type === 'reference') {
    return getValue(value) || getValue(value, 'reference')
  }

  if (type === 'text') {
    return getValue(value)
  }

  if (type === 'file') {
    return getValue(value, 'filename')
  }

  return getValue(value, type)
}

onMounted(async () => {
  await getTypes()
  await getEntities()
})
</script>

<template>
  <div>
    <div class="overflow-auto">
      <table class="w-full table-auto text-sm">
        <thead>
          <tr>
            <th class="w-7" />

            <th
              v-for="column in rawColumns"
              :key="column.name"
              class="cursor-pointer p-3 text-left hover:bg-gray-50"
              @click="getEntities(1, undefined, column.name)"
            >
              <div
                class="flex items-center gap-2"
                :class="{
                  'justify-center': column.type === 'boolean',
                  'justify-end': column.type === 'number',
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
            class="group border-t border-gray-200 hover:bg-gray-50"
          >
            <td>
              <div class="relative ml-1 w-7">
                <nuxt-link :to="{ path: `/${accountId}/${row._id}`, query }">
                  <img
                    v-if="row._thumbnail"
                    :src="row._thumbnail"
                    class="print-as-is size-7 rounded-full object-cover transition-opacity group-hover:opacity-0"
                    :class="color()"
                  >

                  <div
                    v-else
                    class="print-as-is size-7 rounded-full transition-opacity group-hover:opacity-0"
                    :class="color()"
                  />
                </nuxt-link>

                <my-button
                  class="absolute inset-0 size-7 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
                  icon="edit"
                  @click.stop="navigateTo({ path, query, hash: `#edit-${row._id}` }, { replace: true })"
                />
              </div>
            </td>

            <td
              v-for="column in rawColumns"
              :key="column.name"
              :class="{
                'text-right': column.type === 'number',
              }"
            >
              <nuxt-link
                class="flex size-full items-center px-3 py-2"
                :class="{
                  'justify-center': column.type === 'boolean',
                  'justify-end': column.type === 'number',
                }"
                :to="{ path: `/${accountId}/${row._id}`, query }"
              >
                {{ renderColumn(row[column.name], column.type, column.decimals) }}

                <span v-if="column.name === 'name' && !renderColumn(row[column.name], column.type, column.decimals)">
                  {{ row._id }}
                </span>

                <my-icon
                  v-if="column.type === 'boolean' && getValue(row[column.name], 'boolean')"
                  icon="checkmark"
                />
              </nuxt-link>
            </td>

            <td class="pr-1 pt-1">
              <n-popover
                class="max-w-sm"
                placement="left"
              >
                <template #trigger>
                  <my-icon
                    v-if="renderColumn(row._sharing, 'string') === 'public'"
                    class="text-gray-500 group-hover:text-orange-600"
                    icon="sharing-public"
                  />
                  <my-icon
                    v-else-if="renderColumn(row._sharing, 'string') === 'domain'"
                    class="text-gray-500 group-hover:text-yellow-600"
                    icon="sharing-domain"
                  />
                  <my-icon
                    v-else
                    class="text-gray-500 group-hover:text-green-600"
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="total >= 10"
      class="mt-2 flex w-full justify-end"
    >
      <n-pagination
        v-model:page="page"
        show-size-picker
        :item-count="total"
        :page-size="tablePageSize"
        :page-sizes="[10, 25, 100, 250]"
        @update:page="getEntities($event)"
        @update:page-size="getEntities(1, $event)"
      />
    </div>
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
