<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NPopover } from 'naive-ui'

const { t } = useI18n()
const { userId } = useUser()

const entityId = defineModel('entityId', { type: String, default: undefined })
const entityParentId = defineModel('entityParentId', { type: String, default: undefined })
const entityTypeId = defineModel('entityTypeId', { type: String, default: undefined })
const isUpdating = defineModel('isUpdating', { type: Boolean, default: false })

const props = defineProps({
  entitySharing: { type: String, default: undefined },
  properties: { type: Array, required: true },
  edit: { type: Boolean, default: false }
})

const visibleProperties = computed(() => props.edit ? props.properties : props.properties.filter((x) => x.mandatory || x.values))
</script>

<template>
  <div>
    <div
      v-for="property in visibleProperties"
      :key="property.name"
      class="grid grid-cols-1 gap-0 pt-3 first-of-type:pt-0 md:grid-cols-3 md:gap-4 md:border-t md:border-gray-100 md:pt-0 md:first-of-type:border-t-0"
    >
      <div
        class="flex justify-start gap-2 pb-0 pt-1 font-medium text-[#1E434C] md:justify-end md:py-2 md:text-right"
        :class="{ 'text-red-700': property.mandatory && (edit || !property.values) }"
      >
        <span
          v-if="property.values && property.values.length > 1"
          class="truncate"
        >
          {{ property.labelPlural || property.label || property.name }}
        </span>
        <span
          v-else
          class="truncate"
        >
          {{ property.label || property.name }}
        </span>

        <div
          class="mt-1.5 flex w-2.5 flex-col gap-0.5"
          :class="{ '!-my-0.5': userId && entitySharing && property.description && property.sharing }"
        >
          <template v-if="userId && entitySharing && property.sharing">
            <n-popover
              v-if="entitySharing === 'public' && property.sharing === 'public'"
              class="max-w-sm text-sm"
              placement="top"
            >
              <template #trigger>
                <my-icon
                  icon="sharing-public"
                  class="cursor-help text-sm text-orange-400"
                />
              </template>

              <div class="text-sm">
                {{ t('publicProperty') }}
              </div>
            </n-popover>

            <n-popover
              v-if="entitySharing === 'public' && property.sharing === 'domain'"
              class="max-w-sm text-sm"
              placement="top"
            >
              <template #trigger>
                <my-icon
                  icon="sharing-domain"
                  class="cursor-help text-sm text-yellow-600"
                />
              </template>

              <div class="text-sm">
                {{ t('domainProperty') }}
              </div>
            </n-popover>

            <n-popover
              v-if="entitySharing === 'domain' && ['domain', 'public'].includes(property.sharing)"
              class="max-w-sm text-sm"
              placement="top"
            >
              <template #trigger>
                <my-icon
                  icon="sharing-domain"
                  class="cursor-help text-sm text-yellow-600"
                />
              </template>

              <div class="text-sm">
                {{ t('domainProperty') }}
              </div>
            </n-popover>
          </template>

          <n-popover
            v-if="userId && property.description"
            class="max-w-sm text-sm"
            placement="top"
          >
            <template #trigger>
              <my-icon
                icon="info"
                class="cursor-help text-sm text-blue-600"
              />
            </template>

            <my-markdown
              class="text-sm"
              :source="property.description"
            />
          </n-popover>
        </div>
      </div>

      <div class="pb-1 pt-0 md:col-span-2 md:py-1">
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
    publicProperty: This property is public and visible to everyone.
    domainProperty: This property is visible to anyone who is logged in.
  et:
    publicProperty: See parameeter on avalik ja kõigile nähtav.
    domainProperty: See parameeter on nähtav kõigile sisse logitud kasutajatele.
</i18n>
