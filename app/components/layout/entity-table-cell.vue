<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NPopover } from 'naive-ui'

const props = defineProps({
  values: { type: Array, required: true },
  isName: { type: Boolean, default: false },
  entityId: { type: String, required: true },
  fallbackId: { type: String, default: null }
})

const { locale } = useI18n()

const localeValues = computed(() => {
  // If this is the name column and there are no values, use fallback _id
  if (props.isName && (!props.values || props.values.length === 0) && props.fallbackId) {
    return [{ string: props.fallbackId }]
  }

  return props.values.filter((x) => !x.language || x.language === locale.value)
})

const firstValue = computed(() => localeValues.value[0])
const hasMultipleValues = computed(() => localeValues.value.length > 1)
</script>

<template>
  <div
    v-if="!hasMultipleValues && localeValues.length > 0"
    class="truncate"
  >
    <property-value
      :entity-id="entityId"
      :is-name="isName"
      :value="firstValue"
    />
  </div>
  <div
    v-else-if="hasMultipleValues"
    class="truncate"
  >
    <n-popover
      trigger="hover"
      placement="bottom-start"
    >
      <template #trigger>
        <div class="cursor-help">
          <property-value
            :entity-id="entityId"
            :is-name="isName"
            :value="firstValue"
          />
          <span class="ml-1 text-xs text-gray-500">
            (+{{ localeValues.length - 1 }})
          </span>
        </div>
      </template>

      <template #default>
        <div class="max-w-sm space-y-1 text-sm">
          <div
            v-for="v in localeValues"
            :key="v._id || Math.random()"
            class="truncate"
          >
            <property-value
              :entity-id="entityId"
              :is-name="isName"
              :value="v"
            />
          </div>
        </div>
      </template>
    </n-popover>
  </div>
</template>
