<script setup>
import { NPopover } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: undefined },
  properties: { type: Array, required: true },
  edit: { type: Boolean, default: false }
})

const visibleProperties = computed(() => props.edit ? props.properties : props.properties.filter(x => x.mandatory || x.values))
</script>

<template>
  <div>
    <div
      v-for="property in visibleProperties"
      :key="property.name"
      class="grid grid-cols-3 gap-3 border-t first-of-type:border-t-0 border-gray-100"
    >
      <div
        class="py-2 flex items-top justify-end gap-1 text-[#1E434C] font-medium"
        :class="{ 'text-red-700' : property.mandatory && (edit || !property.values) }"
      >
        {{
          property.values && property.values.length > 1
            ? (property.labelPlural || property.label || property.name)
            : (property.label || property.name)
        }}

        <n-popover
          v-if="property.description"
          class="max-w-xs"
          placement="top"
        >
          <template #trigger>
            <span class="w-3 h-3 text-blue-500 text-xs font-bold flex items-center justify-center cursor-pointer">i</span>
          </template>
          {{ property.description }}
        </n-popover>

        <div
          v-else
          class="w-3 h-3"
        />
      </div>

      <div class="col-span-2 py-1">
        <entity-property-edit
          v-if="edit"
          :classifiers="property.classifier?.map(x => x.reference)"
          :set="property.set?.map(x => x.string)"
          :decimals="property.decimals"
          :entity-id="entityId"
          :property="property.name"
          :is-multilingual="property.multilingual"
          :type="property.type"
          :values="property.values"
        />
        <entity-property-view
          v-else-if="!edit && property.values"
          :decimals="property.decimals"
          :is-markdown="property.markdown"
          :values="property.values"
        />
      </div>
    </div>
  </div>
</template>
