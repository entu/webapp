<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NPopover } from 'naive-ui'

const { t } = useI18n()

const entityId = defineModel('entityId', { type: String, default: undefined })
const entityParentId = defineModel('entityParentId', { type: String, default: undefined })
const entityTypeId = defineModel('entityTypeId', { type: String, default: undefined })
const isUpdating = defineModel('isUpdating', { type: Boolean, default: false })

const props = defineProps({
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
        class="py-2 flex items-top justify-end gap-1 text-right text-[#1E434C] font-medium"
        :class="{ 'text-red-700' : property.mandatory && (edit || !property.values) }"
      >
        {{
          property.values && property.values.length > 1
            ? (property.labelPlural || property.label || property.name)
            : (property.label || property.name)
        }}
        <div
          v-if="property.description || property.public"
          class="-mt-0.5 flex flex-col gap-0.5"
        >
          <n-popover
            v-if="property.description"
            class="max-w-sm text-sm"
            placement="top"
          >
            <template #trigger>
              <my-icon
                icon="info"
                class="text-sm text-blue-600 cursor-help"
              />
            </template>

            <div
              v-if="property.description"
              class="text-sm"
            >
              {{ property.description }}
            </div>
          </n-popover>

          <n-popover
            v-if="property.public"
            class="max-w-sm text-sm"
            placement="top"
          >
            <template #trigger>
              <my-icon
                icon="sharing/public"
                class="text-sm text-orange-400 float-right cursor-help"
              />
            </template>

            <div class="text-sm">
              {{ t('publicProperty') }}
            </div>
          </n-popover>
        </div>

        <div
          v-else
          class="size-3"
        />
      </div>

      <div class="col-span-2 py-1">
        <property-edit
          v-if="edit"
          v-model:entity-id="entityId"
          v-model:entity-parent-id="entityParentId"
          v-model:entity-type-id="entityTypeId"
          v-model:updating="isUpdating"
          :decimals="property.decimals"
          :is-multilingual="property.multilingual"
          :is-list="property.list"
          :property="property.name"
          :reference-query="property.referenceQuery"
          :set="property.set?.map(x => x.string)"
          :type="property.type"
          :values="property.values"
          :disabled="isUpdating"
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

<i18n lang="yaml">
  en:
    publicProperty: If entity is public, then this property is visible to everyone.
  et:
    publicProperty: Kui objekt on avalik, siis see parameeter on kõigile nähtav.
</i18n>
