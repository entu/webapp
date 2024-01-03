<script setup>
import { NPopover } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: undefined },
  entityParentId: { type: String, default: null },
  entityTypeId: { type: String, default: null },
  properties: { type: Array, required: true },
  edit: { type: Boolean, default: false }
})

const emit = defineEmits(['update:entity', 'updating:entity', 'add:entity'])

const updating = ref(false)

const visibleProperties = computed(() => props.edit ? props.properties : props.properties.filter(x => x.mandatory || x.values))

function onEntityUpdating (entity) {
  console.log('onEntityUpdating', entity)
  updating.value = true
  emit('updating:entity', entity)
}

function onEntityUpdate (entity) {
  console.log('onEntityUpdate', entity)
  updating.value = false
  emit('update:entity', entity)
}
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
          class="max-w-sm"
          placement="top"
        >
          <template #trigger>
            <span class="size-3 flex items-center justify-center text-blue-600 text-xs font-bold bg-blue-100 rounded cursor-pointer">i</span>
          </template>
          <div class="text-xs">
            {{ property.description }}
          </div>
        </n-popover>

        <div
          v-else
          class="size-3"
        />
      </div>

      <div class="col-span-2 py-1">
        <property-edit
          v-if="edit"
          :decimals="property.decimals"
          :entity-id="entityId"
          :entity-parent-id="entityParentId"
          :entity-type-id="entityTypeId"
          :is-multilingual="property.multilingual"
          :property="property.name"
          :reference-query="property.referenceQuery"
          :set="property.set?.map(x => x.string)"
          :type="property.type"
          :values="property.values"
          :disabled="updating"
          @updating:entity="onEntityUpdating($event)"
          @update:entity="onEntityUpdate($event)"
          @add:entity="emit('add:entity', $event)"
        />
        <property-view
          v-else-if="!edit && property.values"
          :decimals="property.decimals"
          :is-markdown="property.markdown"
          :values="property.values"
        />
      </div>
    </div>
  </div>
</template>
