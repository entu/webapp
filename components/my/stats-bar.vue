<script setup>
import { NPopover } from 'naive-ui'
const { t } = useI18n()

const props = defineProps({
  label: { type: String, default: null },
  usage: { type: Number, default: 0 },
  deleted: { type: Number, default: 0 },
  limit: { type: Number, default: 0 },
  isBytes: { type: Boolean, default: false },
  color: { type: String, default: null },
  deletedColor: { type: String, default: null }
})

const { n } = useI18n()

const usagePercent = computed(() => {
  const { usage, deleted, limit } = props
  const total = usage + deleted

  if (!usage) return 0
  if (!limit || usage > limit) return Math.round(usage * 100 / total)

  return Math.round(usage * 100 / limit)
})

const deletedPercent = computed(() => {
  const { usage, deleted, limit } = props
  const total = usage + deleted

  if (!deleted) return 0
  if (!limit || deleted > limit) return Math.round(deleted * 100 / total)

  return Math.round(deleted * 100 / limit)
})

const limitPercent = computed(() => {
  const { usage, deleted, limit } = props
  const total = usage + deleted

  if (!limit) return undefined
  if (!total) return undefined
  if (total <= limit) return undefined

  return Math.round(limit * 100 / total)
})

const overLimit = computed(() => {
  const { usage, deleted, limit } = props
  if (!limit) return undefined

  const over = usage + deleted - limit

  if (over > 0) return over
})

const usageStr = computed(() => props.isBytes ? humanFileSize(props.usage) : n(props.usage))
const deletedStr = computed(() => props.isBytes ? humanFileSize(props.deleted) : n(props.deleted))
const totalStr = computed(() => props.isBytes ? humanFileSize(props.usage + props.deleted) : n(props.usage + props.deleted))
const limitStr = computed(() => props.isBytes ? humanFileSize(props.limit) : n(props.limit))
const overLimitStr = computed(() => overLimit.value && props.isBytes ? humanFileSize(overLimit.value) : n(overLimit.value))
</script>

<template>
  <n-popover content-class="grid grid-cols-2">
    <template #trigger>
      <div class="my-3 p-2 rounded hover:bg-gray-50 cursor-help">
        <div class="flex justify-between">
          <div>
            {{ label }}
          </div>
          <div
            v-if="limit"
            class="text-gray-400"
            :class="{ 'text-red-700': limitPercent }"
          >
            {{ t('limit') }}
          </div>
        </div>

        <div class="relative h-3 w-full mb-0.5 flex bg-gray-100">
          <div
            class="h-full min-w-0.5"
            :color="color"
            :style="`width:${usagePercent}%;background:${color}`"
          />

          <div
            v-if="limitPercent"
            class="absolute h-full right-0 border-l-2 border-l-red-700 bg-red-700 bg-opacity-50"
            :style="`left:${limitPercent}%`"
          />

          <div
            v-if="deleted"
            class="h-full min-w-0.5"
            :color="color"
            :style="`width:${deletedPercent}%;background:${deletedColor}`"
          />
        </div>

        <div class="flex justify-between">
          <div>
            {{ totalStr || '' }}
          </div>
          <div
            v-if="limit"
            class="text-gray-400"
            :class="{ 'text-red-700': limitPercent }"
          >
            {{ limitStr || '' }}
          </div>
        </div>
      </div>
    </template>

    <template v-if="usage">
      <div class="flex items-center gap-2">
        <div
          class="size-4"
          :style="`background:${color}`"
        />
        {{ t('usageInfo') }}
      </div>
      <div class="text-right">
        {{ usageStr }}
      </div>
    </template>

    <template v-if="deleted">
      <div class="flex items-center gap-2">
        <div
          class="size-4"
          :style="`background:${deletedColor}`"
        />
        {{ t('deletedInfo') }}
      </div>
      <div class="text-right">
        {{ deletedStr }}
      </div>
    </template>

    <template v-if="limit">
      <div class="flex items-center gap-2">
        <div
          class="size-4 bg-gray-100"
        />
        {{ t('limitInfo') }}
      </div>
      <div class="text-right">
        {{ limitStr }}
      </div>
    </template>

    <template v-if="overLimit">
      <div class="flex items-center gap-2 text-red-700 font-bold">
        <div
          class="size-4 bg-red-500 opacity-20"
        />
        {{ t('overLimitInfo') }}
      </div>
      <div class="text-right text-red-700 font-bold">
        {{ overLimitStr }}
      </div>
    </template>
  </n-popover>
</template>

<i18n lang="yaml">
  en:
    deleted: deleted
    limit: limit
    usageInfo: 'Current:'
    deletedInfo: 'Deleted:'
    limitInfo: 'Limit:'
    overLimitInfo: 'Over limit:'
  et:
    deleted: kustutatud
    limit: limiit
    usageInfo: 'Aktiivne:'
    deletedInfo: 'Kustutatud:'
    limitInfo: 'Limiit:'
    overLimitInfo: 'Üle limiidi:'
</i18n>
