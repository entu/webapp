<script setup>
import { NPopover } from 'naive-ui'

const { n, t } = useI18n()

const props = defineProps({
  label: { type: String, default: null },
  usage: { type: Number, default: 0 },
  deleted: { type: Number, default: 0 },
  limit: { type: Number, default: 0 },
  isBytes: { type: Boolean, default: false },
  color: { type: String, default: null },
  deletedColor: { type: String, default: null }
})

const usagePercent = computed(() => {
  const total = props.usage + props.deleted

  if (!props.usage) return 0
  if (!props.limit || props.usage > props.limit) return Math.round(props.usage * 100 / total)

  return Math.round(props.usage * 100 / props.limit)
})

const deletedPercent = computed(() => {
  const total = props.usage + props.deleted

  if (!props.deleted) return 0
  if (!props.limit || props.deleted > props.limit) return Math.round(props.deleted * 100 / total)

  return Math.round(props.deleted * 100 / props.limit)
})

const limitPercent = computed(() => {
  const total = props.usage + props.deleted

  if (!props.limit) return
  if (!total) return
  if (total <= props.limit) return

  return Math.round(props.limit * 100 / total)
})

const overLimit = computed(() => {
  if (!props.limit) return 0

  const over = props.usage + props.deleted - props.limit

  return over > 0 ? over : 0
})

const usageStr = computed(() => props.isBytes ? humanFileSize(n, props.usage) : n(props.usage))
const deletedStr = computed(() => props.isBytes ? humanFileSize(n, props.deleted) : n(props.deleted))
const totalStr = computed(() => props.isBytes ? humanFileSize(n, props.usage + props.deleted) : n(props.usage + props.deleted))
const limitStr = computed(() => props.isBytes ? humanFileSize(n, props.limit) : n(props.limit))
const overLimitStr = computed(() => overLimit.value && props.isBytes ? humanFileSize(n, overLimit.value) : n(overLimit.value))
</script>

<template>
  <n-popover content-class="grid grid-cols-2">
    <template #trigger>
      <div class="my-3 cursor-help rounded p-2 hover:bg-gray-50">
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

        <div class="relative mb-0.5 flex h-3 w-full bg-gray-100">
          <div
            class="h-full min-w-0.5"
            :color="color"
            :style="`width:${usagePercent}%;background:${color}`"
          />

          <div
            v-if="limitPercent"
            class="absolute right-0 h-full border-l-2 border-l-red-700 bg-red-700/50"
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
      <div class="flex items-center gap-2 font-bold text-red-700">
        <div
          class="size-4 bg-red-500 opacity-20"
        />
        {{ t('overLimitInfo') }}
      </div>
      <div class="text-right font-bold text-red-700">
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
