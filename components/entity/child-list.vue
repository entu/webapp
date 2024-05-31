<script setup>
import { NDataTable } from 'naive-ui'
import { MyIcon, NuxtLink } from '#components'

const props = defineProps({
  entityId: { type: String, required: true },
  typeId: { type: String, required: true },
  referenceField: { type: String, required: true }
})

const align = {
  number: 'right',
  boolean: 'center'
}

const { locale, d, t } = useI18n()
const { accountId } = useAccount()
const { tablePageSize } = useUser()

const sort = ref()
const rawEntities = ref()
const rawColumns = ref([{
  name: 'name',
  label: '',
  type: 'string',
  decimals: undefined
}])
const isLoading = ref(false)
const total = ref(0)
const activeRow = ref(null)
const page = ref(1)

const pagination = computed(() => ({
  page: page.value,
  pageCount: Math.ceil(total.value / tablePageSize.value),
  pageSize: tablePageSize.value,
  showSizePicker: true,
  pageSizes: [25, 50, 100]
}))

const columns = computed(() => [
  {
    key: '_thumbnail',
    title: '',
    width: 44,
    render: row => h(NuxtLink,
      { class: 'link', to: { path: `/${accountId.value}/${row._id}` } },
      () => row._thumbnail
        ? h('img', { class: `size-7 flex-none border border-white hover:border-sky-800 object-cover rounded-full ${color()}`, src: row._thumbnail })
        : h('div', { class: `size-7 flex-none border border-white hover:border-sky-800 rounded-full ${color()}` })
    )
  }, ...rawColumns.value.map(c => ({
    key: c.name,
    title: c.label,
    align: align[c.type] || 'left',
    ellipsis: { tooltip: true },
    render: row => renderColumn(row, c),
    renderSorterMyIcon: ({ order }) => {
      if (order === false) return null
      if (order === 'ascend') return h(MyIcon, { class: 'text-sky-800', icon: 'sort-ascending' })
      if (order === 'descend') return h(MyIcon, { class: 'text-sky-800', icon: 'sort-descending' })
    },
    sorter: true
  }))
])

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
    rawColumns.value = entities.map(e => ({
      name: getValue(e.name),
      label: getValue(e.label),
      type: getValue(e.type),
      decimals: getValue(e.decimals, 'number')
    }))
  } else {
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

    rawColumns.value = entities.map(e => ({
      name: getValue(e.name),
      label: getValue(e.label),
      type: getValue(e.type),
      decimals: getValue(e.decimals, 'number')
    }))
  }
}

async function getEntities (setPage, setPageSize, sorter = sort.value) {
  isLoading.value = true

  if (!setPage) {
    page.value = setPage
  }
  if (setPageSize) {
    tablePageSize.value = setPageSize
  }

  const field = sorter ? rawColumns.value.find(c => c.name === sorter.columnKey).type : null

  const { entities, count } = await apiGetEntities({
    [props.referenceField]: props.entityId,
    '_type.reference': props.typeId,
    props: [
      '_thumbnail',
      ...rawColumns.value.map(c => c.name)
    ].join(','),
    sort: sorter ? `${sorter.order === 'descend' ? '-' : ''}${sorter.columnKey}.${field}` : null,
    limit: tablePageSize.value,
    skip: tablePageSize.value * (page.value - 1)
  })

  rawEntities.value = entities
  total.value = count
  sort.value = sorter

  pagination.value.page = page
  pagination.value.pageCount = Math.ceil(count / pageSize)
  pagination.value.pageSize = pageSize

  isLoading.value = false
}

function color () {
  const colors = ['bg-amber-50', 'bg-blue-50', 'bg-cyan-50', 'bg-emerald-50', 'bg-fuchsia-50', 'bg-gray-50', 'bg-green-50', 'bg-indigo-50', 'bg-lime-50', 'bg-neutral-50', 'bg-orange-50', 'bg-pink-50', 'bg-purple-50', 'bg-red-50', 'bg-rose-50', 'bg-sky-50', 'bg-slate-50', 'bg-stone-50', 'bg-teal-50', 'bg-violet-50', 'bg-yellow-50', 'bg-zinc-50'
  ]
  const rnd = Math.floor(Math.random() * colors.length)

  return colors[rnd]
}

function renderColumn (row, { type, name, decimals }) {
  if (type === 'number' && getValue(row[name], 'number')) {
    return getValue(row[name], 'number').toLocaleString(locale.value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  if (type === 'boolean' && getValue(row[name], 'boolean')) {
    return h(MyIcon, { icon: 'checkmark' })
  }

  if (type === 'datetime' && getValue(row[name], 'datetime')) {
    return d(getValue(row[name], 'datetime'), 'datetime')
  }

  if (type === 'date' && getValue(row[name], 'date')) {
    return d(getValue(row[name], 'date'), 'date')
  }

  if (type === 'reference') {
    return h(NuxtLink, {
      class: 'hover:underline',
      to: { path: `/${accountId.value}/${getValue(row[name], 'reference')}` }
    }, () => (getValue(row[name]) || getValue(row[name], 'reference'))
    )
  }

  return getValue(row[name], type)
}

onMounted(async () => {
  await getTypes()
  await getEntities()
})
</script>

<template>
  <n-data-table
    remote
    size="small"
    summary-placement="top"
    :bordered="false"
    :bottom-bordered="false"
    :columns="columns"
    :data="rawEntities"
    :loading="isLoading"
    :pagination="pagination"
    :paginate-single-page="total > tablePageSize"
    :row-key="row => row._id"
    @update:page="getEntities($event)"
    @update:page-size="getEntities(1, $event)"
    @update:sorter="getEntities(1, undefined, $event)"
  />
</template>

<i18n lang="yaml">
  en:
    perPage: '{n} / page'
  et:
    perPage: '{n} / leht'
</i18n>
