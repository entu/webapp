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
      class="grid grid-cols-1"
      :class="{
        'gap-0 pt-3 first-of-type:pt-0 md:grid-cols-3 md:items-center md:gap-4 md:border-t md:border-gray-100 md:pt-0 md:first-of-type:border-t-0': edit,
        'border-t border-gray-200 py-1 first-of-type:border-t-0 md:grid-cols-[140px_1fr] md:gap-4': !edit,
      }"
    >
      <div
        class="flex justify-start md:justify-end md:text-right"
        :class="{
          'gap-2 pt-1 pb-0 font-medium text-brand md:py-2': edit,
          'items-center gap-1 pt-1 md:pt-0.5': !edit,
          'text-gray-400': !edit && (!property.mandatory || property.values),
          'text-red-700': property.mandatory && (edit || !property.values),
        }"
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
          class="flex"
          :class="{
            'mt-1.5 w-2.5 flex-col gap-0.5': edit,
            '-my-0.5!': edit && userId && entitySharing && property.description && property.sharing,
            'gap-1 opacity-60 hover:opacity-100': !edit,
          }"
        >
          <template v-if="userId && entitySharing && property.sharing">
            <n-popover
              v-if="entitySharing === 'public' && property.sharing === 'public'"
              class="max-w-sm text-sm"
              placement="top"
            >
              <template #trigger>
                <my-icon
                  class="cursor-help text-sm text-orange-400"
                  icon="sharing-public"
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
                  class="cursor-help text-sm text-yellow-600"
                  icon="sharing-domain"
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
                  class="cursor-help text-sm text-yellow-600"
                  icon="sharing-domain"
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
                class="cursor-help text-sm text-blue-600"
                icon="info"
              />
            </template>

            <my-markdown
              class="text-sm"
              :source="property.description"
            />
          </n-popover>
        </div>
      </div>

      <div
        :class="{
          'pt-0 pb-1 md:col-span-2 md:py-1': edit,
          'text-gray-900': !edit,
        }"
      >
        <property-edit
          v-if="edit"
          v-model:entity-id="entityId"
          v-model:entity-parent-id="entityParentId"
          v-model:entity-type-id="entityTypeId"
          v-model:is-updating="isUpdating"
          :decimals="property.decimals"
          :disabled="isUpdating"
          :is-list="property.list"
          :is-multilingual="property.multilingual"
          :property="property.name"
          :reference-query="property.referenceQuery"
          :set="property.set?.map(x => x.string)"
          :type="property.type"
          :values="property.values"
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
