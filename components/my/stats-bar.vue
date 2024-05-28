<script setup>
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

const usageStr = computed(() => props.isBytes ? humanFileSize(props.usage) : n(props.usage))
const deletedStr = computed(() => props.isBytes ? humanFileSize(props.deleted) : n(props.deleted))
const limitStr = computed(() => props.isBytes ? humanFileSize(props.limit) : n(props.limit))
</script>

<template>
  <div class="my-3">
    <div class="flex justify-between">
      <div>
        {{ label }}
      </div>
      <div
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
        {{ usageStr || '' }}
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

<i18n lang="yaml">
  en:
    deleted: deleted
    limit: limit
  et:
    deleted: kustutatud
    limit: limiit
</i18n>
