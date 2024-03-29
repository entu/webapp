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

const pagination = ref({
  page: 1,
  pageCount: 1,
  pageSize: 25,
  showSizePicker: true,
  pageSizes: [25, 50, 100],
  selectProps: {
    renderLabel: e => t('perPage', e.value)
  }
})

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
    render: (row) => {
      if (c.type === 'number' && getValue(row[c.name], 'number')) return getValue(row[c.name], 'number').toLocaleString(locale.value, { minimumFractionDigits: c.decimals, maximumFractionDigits: c.decimals })

      if (c.type === 'boolean' && getValue(row[c.name], 'boolean')) return h(MyIcon, { icon: 'checkmark' })

      if (c.type === 'datetime' && getValue(row[c.name], 'datetime')) return d(getValue(row[c.name], 'datetime'), 'datetime')

      if (c.type === 'date' && getValue(row[c.name], 'date')) return d(getValue(row[c.name], 'date'), 'date')

      return getValue(row[c.name], c.type)
    },
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

async function getEntities (page = pagination.value.page, pageSize = pagination.value.pageSize, sorter = sort.value) {
  isLoading.value = true

  const field = sorter ? rawColumns.value.find(c => c.name === sorter.columnKey).type : null

  const { entities, count } = await apiGetEntities({
    [props.referenceField]: props.entityId,
    '_type.reference': props.typeId,
    props: [
      '_thumbnail',
      ...rawColumns.value.map(c => c.name)
    ].join(','),
    sort: sorter ? `${sorter.order === 'descend' ? '-' : ''}${sorter.columnKey}.${field}` : null,
    limit: pageSize,
    skip: pageSize * (page - 1)
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
    :paginate-single-page="total > pagination.pageSizes.at(0)"
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
