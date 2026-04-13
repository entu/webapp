<script setup>
import { NPagination, NSpin, NTooltip } from 'naive-ui'

const { t, d, n, locale } = useI18n()
const { accountId } = useAccount()
const { query } = useRoute()

const emit = defineEmits(['close'])

const show = defineModel('show', { type: Boolean, default: false })
const entityId = defineModel('entityId', { type: String, required: true })

const props = defineProps({
  typeId: { type: String, default: null }
})

const entityTypeStore = useEntityTypeStore()
const { entityTypes } = storeToRefs(entityTypeStore)

const groups = ref([])
const isLoading = ref(false)
const page = ref(1)
const pageSize = ref(25)
const total = ref(0)

watch([show, entityId], () => {
  page.value = 1
  loadHistory()
}, { immediate: true })

async function loadHistory () {
  if (!show.value) return
  if (!entityId.value) return

  isLoading.value = true
  groups.value = []

  // Ensure entity type definitions are loaded
  if (props.typeId && !entityTypes.value[props.typeId]) {
    await entityTypeStore.get(props.typeId)
  }

  const { changes: raw, count } = await apiGetEntityHistory(entityId.value, {
    limit: pageSize.value,
    skip: pageSize.value * (page.value - 1)
  })

  total.value = count

  if (!raw?.length) {
    isLoading.value = false
    groups.value = []
    return
  }

  // Build prop definition map: name -> { label, ordinal, decimals, markdown }
  const propDefs = {}
  const typedProps = entityTypes.value[props.typeId]?.props || []
  for (const p of typedProps) {
    if (p.name) propDefs[p.name] = p
  }

  // Fetch names for all unique editors in parallel
  const userIds = [...new Set(raw.map((x) => x.by).filter(Boolean).map(String))]
  const userNames = {}

  await Promise.all(userIds.map(async (id) => {
    const entity = await apiGetEntity(id, ['name'])
    userNames[id] = getValue(entity?.name) || null
  }))

  // Group by user + 1-minute bucket, newest first
  const buckets = {}

  for (const item of raw) {
    const byStr = item.by ? String(item.by) : ''
    const bucket = item.at ? minuteBucket(item.at) : 'unknown'
    const key = `${byStr}::${bucket}`

    if (!buckets[key]) {
      buckets[key] = {
        at: item.at,
        by: byStr,
        userName: byStr ? userNames[byStr] : null,
        propMap: {}
      }
    }

    const propKey = item.type
    if (!buckets[key].propMap[propKey]) {
      const def = propDefs[item.type]
      buckets[key].propMap[propKey] = {
        type: item.type,
        label: def?.label || item.type,
        ordinal: def?.ordinal ?? 9999,
        decimals: def?.decimals,
        markdown: def?.markdown,
        oldValues: [],
        newValues: []
      }
    }

    const entry = buckets[key].propMap[propKey]
    const fOld = formatValue(item.old, entry.decimals)
    const fNew = formatValue(item.new, entry.decimals)

    if (fOld) entry.oldValues.push({ ...fOld, at: item.at })
    if (fNew) entry.newValues.push({ ...fNew, at: item.at })
  }

  groups.value = Object.values(buckets).sort((a, b) => {
    if (!a.at) return 1
    if (!b.at) return -1
    return new Date(b.at) - new Date(a.at)
  }).map((g) => ({
    ...g,
    changes: Object.values(g.propMap).sort((a, b) => a.ordinal - b.ordinal).map((c) => ({
      ...c,
      oldValues: c.oldValues.sort((a, b) => (b.at ? new Date(b.at) : 0) - (a.at ? new Date(a.at) : 0)),
      newValues: c.newValues.sort((a, b) => (b.at ? new Date(b.at) : 0) - (a.at ? new Date(a.at) : 0))
    }))
  }))

  isLoading.value = false
}

function minuteBucket (at) {
  const dt = new Date(at)
  dt.setSeconds(0, 0)
  return dt.toISOString()
}

function formatValue (val, decimals) {
  if (val === null || val === undefined) return null
  // reference + datetime (e.g. auth log-in events)
  if (val.reference !== undefined && val.datetime !== undefined) {
    const refId = String(val.reference)
    const text = val.string || refId
    return { text, href: `/${accountId.value}/${refId}`, suffix: d(new Date(val.datetime), 'datetime'), language: val.language }
  }
  // reference only
  if (val.reference !== undefined) {
    const refId = String(val.reference)
    return { text: val.string || refId, href: `/${accountId.value}/${refId}`, language: val.language }
  }
  // file — link uses the property _id
  if (val.filename !== undefined && val.filename !== null) {
    const suffix = val.filesize ? humanFileSize(n, val.filesize) : null
    return { text: val.filename, href: val._id ? `/${accountId.value}/file/${val._id}` : null, suffix, language: val.language }
  }
  // boolean
  if (val.boolean !== undefined && val.boolean !== null) return { text: val.boolean ? '✓' : '✗', language: val.language }
  // datetime
  if (val.datetime !== undefined && val.datetime !== null) return { text: d(new Date(val.datetime), 'datetime'), language: val.language }
  // date
  if (val.date !== undefined && val.date !== null) return { text: d(new Date(val.date), 'date'), language: val.language }
  // number
  if (val.number !== undefined && val.number !== null) return { text: val.number.toLocaleString(locale.value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }), language: val.language }
  // plain string
  if (val.string !== undefined && val.string !== null) return { text: String(val.string), language: val.language }
  return null
}
</script>

<template>
  <my-drawer
    v-model:show="show"
    :title="t('title')"
    @close="emit('close')"
  >
    <div class="flex h-full flex-col">
      <div class="relative min-h-0 flex-1 overflow-y-auto">
        <div
          v-if="isLoading"
          class="absolute inset-0 z-10 flex items-center justify-center bg-white/60"
        >
          <n-spin />
        </div>

        <div
          v-if="!isLoading && groups.length === 0"
          class="px-3 py-8 text-center text-sm text-slate-400 md:px-6"
        >
          {{ t('empty') }}
        </div>

        <table
          v-else
          class="w-full table-auto"
        >
          <thead>
            <tr class="text-left whitespace-nowrap">
              <th class="p-3">
                {{ t('editor') }}
              </th>
              <th class="p-3">
                {{ t('property') }}
              </th>
              <th class="p-3">
                {{ t('old') }}
              </th>
              <th class="p-3">
                {{ t('new') }}
              </th>
            </tr>
          </thead>

          <tbody>
            <template
              v-for="group in groups"
              :key="`${group.by}-${group.at}`"
            >
              <tr
                v-for="(item, idx) in group.changes"
                :key="item.type"
                class="border-t border-gray-200 hover:bg-gray-50"
              >
                <!-- editor + date: only on first row of the group, spans all rows -->
                <td
                  v-if="idx === 0"
                  class="px-3 py-2 align-top"
                  :rowspan="group.changes.length"
                >
                  <div class="font-medium text-slate-700">
                    {{ group.userName || (group.by ? group.by.slice(-8) : t('system')) }}
                  </div>
                  <div
                    v-if="group.at"
                    class="text-sm text-slate-400"
                  >
                    {{ d(new Date(group.at), 'datetime') }}
                  </div>
                </td>

                <!-- property name -->
                <td class="px-3 py-2 align-top whitespace-nowrap">
                  <span class="font-medium text-slate-500">{{ item.label }}</span>
                </td>

                <!-- old values -->
                <td class="px-3 py-2 align-top">
                  <n-tooltip
                    v-for="v in item.oldValues"
                    :key="v.text"
                    :disabled="!v.at"
                    placement="right"
                  >
                    <template #trigger>
                      <div class="flex items-center gap-1.5 text-red-700 line-through">
                        <span
                          v-if="v.language"
                          class="rounded bg-red-100 px-1 text-xs font-medium uppercase"
                        >{{ v.language }}</span>
                        <nuxt-link
                          v-if="v.href"
                          class="underline"
                          :to="{ path: v.href, query }"
                        >{{ v.text }}</nuxt-link>
                        <template v-else>
                          {{ v.text }}
                        </template>
                        <span
                          v-if="v.suffix"
                          class="text-xs opacity-70"
                        >{{ v.suffix }}</span>
                      </div>
                    </template>
                    {{ v.at ? d(new Date(v.at), 'datetimeseconds') : '' }}
                  </n-tooltip>
                </td>

                <!-- new values -->
                <td class="px-3 py-2 align-top">
                  <n-tooltip
                    v-for="v in item.newValues"
                    :key="v.text"
                    :disabled="!v.at"
                    placement="right"
                  >
                    <template #trigger>
                      <div class="flex items-center gap-1.5 text-green-700">
                        <span
                          v-if="v.language"
                          class="rounded bg-green-100 px-1 text-xs font-medium uppercase"
                        >{{ v.language }}</span>
                        <nuxt-link
                          v-if="v.href"
                          class="underline"
                          :to="{ path: v.href, query }"
                        >{{ v.text }}</nuxt-link>
                        <template v-else>
                          {{ v.text }}
                        </template>
                        <span
                          v-if="v.suffix"
                          class="text-xs opacity-70"
                        >{{ v.suffix }}</span>
                      </div>
                    </template>
                    {{ v.at ? d(new Date(v.at), 'datetimeseconds') : '' }}
                  </n-tooltip>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div
        v-if="total >= 10"
        class="flex shrink-0 justify-end border-t border-gray-200 px-3 py-2"
      >
        <n-pagination
          v-model:page="page"
          show-size-picker
          :item-count="total"
          :page-size="pageSize"
          :page-sizes="[25, 100, 250]"
          @update:page="page = $event; loadHistory()"
          @update:page-size="pageSize = $event; page = 1; loadHistory()"
        />
      </div>
    </div>
  </my-drawer>
</template>

<i18n lang="yaml">
  en:
    title: Entity History
    editor: Editor
    property: Property
    old: Before
    new: After
    empty: No history found
    system: System

  et:
    title: Objekti ajalugu
    editor: Muutja
    property: Parameeter
    old: Enne
    new: Pärast
    empty: Ajalugu puudub
    system: Süsteem
</i18n>
