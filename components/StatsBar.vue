<script setup>
import { NProgress } from 'naive-ui'

const { n } = useI18n()

const props = defineProps({
  aLabel: { type: String, default: null },
  aValue: { type: Number, default: null },
  bLabel: { type: String, default: null },
  bValue: { type: Number, default: null },
  isBytes: { type: Boolean, default: false },
  showTotal: { type: Boolean, default: false },
  color: { type: String, default: null },
  railColor: { type: String, default: null }
})

const percentage = computed(() => Math.round(props.aValue * 100 / (props.aValue + props.bValue)))
const bTotal = computed(() => props.showTotal ? props.aValue + props.bValue : props.bValue)
const aValueStr = computed(() => props.isBytes ? humanFileSize(props.aValue) : n(props.aValue))
const bValueStr = computed(() => props.isBytes ? humanFileSize(bTotal.value) : n(bTotal.value))
</script>

<template>
  <div class="my-3">
    <div class="flex justify-between">
      <div>{{ aLabel }}</div>
      <div class="text-stone-400">
        {{ bLabel }}
      </div>
    </div>
    <n-progress
      class="my-1"
      :color="color"
      :rail-color="railColor"
      :height="18"
      :border-radius="4"
      :fill-border-radius="0"
      :show-indicator="false"
      :percentage="percentage"
    />
    <div class="flex justify-between">
      <div>{{ aValueStr || '' }}</div>
      <div class="text-stone-400">
        {{ bValueStr || '' }}
      </div>
    </div>
  </div>
</template>
