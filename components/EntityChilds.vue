<script setup>
import { RouterLink } from 'vue-router'
import { NDataTable } from 'naive-ui'

const props = defineProps({
  account: { type: String, required: true },
  entityId: { type: String, required: true },
  typeId: { type: String, required: true }
})

const { t } = useI18n()
const rawEntities = ref()
const isLoading = ref(false)
const total = ref(0)

const pagination = ref({
  page: 1,
  pageCount: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 25, 50, 100],
  selectProps: {
    renderLabel: e => t('perPage', e.value)
  }
})

const columns = computed(() => [
  {
    title: '',
    key: '_thumbnail',
    width: 42,
    render: row => h(RouterLink,
      {
        class: 'link',
        to: { path: `/${props.account}/${row._id}` }
      }, () => row._thumbnail
        ? h('img', {
          src: row._thumbnail,
          class: `w-7 h-7 flex-none object-cover rounded-full ${color()}`
        })
        : h('div', {
          class: `w-7 h-7 flex-none rounded-full ${color()}`
        })
    )
  },
  {
    title: 'Name',
    key: 'name',
    render: row => h(RouterLink,
      {
        class: 'link',
        to: { path: `/${props.account}/${row._id}` }
      },
      { default: () => getValue(row.name) }
    ),
    sorter: true
  }
])

async function getEntities (page = pagination.value.page, pageSize = pagination.value.pageSize, sorter = undefined) {
  isLoading.value = true

  const sort = sorter ? `${sorter.order === 'descend' ? '-' : ''}${sorter.columnKey}.string` : 'name.string'

  const { entities, count } = await apiGetEntities({
    '_parent.reference': props.entityId,
    '_type.reference': props.typeId,
    props: [
      'name',
      '_thumbnail'
    ].join(','),
    sort,
    limit: pageSize,
    skip: pageSize * (page - 1)
  })

  rawEntities.value = entities
  total.value = count
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

onMounted(getEntities)
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
    :paginate-single-page="false"
    :row-key="row => row._id"
    @update:page="getEntities($event)"
    @update:page-size="getEntities(1, $event)"
    @update:sorter="getEntities(undefined, undefined, $event)"
  />
</template>

<i18n lang="yaml">
  en:
    perPage: '{n} / page'
  et:
    perPage: '{n} / leht'
</i18n>
