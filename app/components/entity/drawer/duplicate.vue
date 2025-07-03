<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NInputNumber, NCheckbox, NButton } from 'naive-ui'

const { t } = useI18n()

const emit = defineEmits(['close'])

const entityId = defineModel('entityId', { type: String, required: true })

const entityTypeStore = useEntityTypeStore()
const { entityTypes } = storeToRefs(entityTypeStore)

const rawEntity = ref()
const isLoading = ref(false)
const isUpdating = ref(false)
const duplicateCount = ref(1)
const selectedProperties = ref({})

const typeId = computed(() => getValue(rawEntity.value?._type, 'reference'))
const entityType = computed(() => entityTypes.value?.[typeId.value] || {})
const entityName = computed(() => getValue(rawEntity.value?.name))

const availableProperties = computed(() => {
  if (!rawEntity.value) return []

  const result = []

  for (const property in rawEntity.value) {
    if (property.startsWith('_')) continue

    const hasValues = rawEntity.value[property] && rawEntity.value[property].length > 0

    if (hasValues) {
      // Get property definition from entity type if available
      const propertyDef = entityType.value?.props?.find((p) => p.name === property) || {}

      // Skip formula properties
      if (propertyDef?.formula) continue

      result.push({
        name: property,
        label: propertyDef?.label || property,
        values: rawEntity.value[property],
        mandatory: propertyDef?.mandatory || false,
        readonly: propertyDef?.readonly || false,
        formula: propertyDef?.formula || false,
        ordinal: propertyDef?.ordinal || 0
      })
    }
  }

  // Show all non-formula properties, sort by ordinal then alphabetically
  return result.sort((a, b) => {
    // Sort by ordinal first
    if (a.ordinal !== b.ordinal) {
      return a.ordinal - b.ordinal
    }
    // If ordinals are equal, sort alphabetically
    return a.label.localeCompare(b.label)
  })
})

watch(availableProperties, (newProps) => {
  const selected = {}
  newProps.forEach((prop) => {
    selected[prop.name] = true
  })
  selectedProperties.value = selected
}, { immediate: true })

watch(entityId, loadEntity, { immediate: true })

async function loadEntity () {
  if (!entityId.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true

  rawEntity.value = await apiGetEntity(entityId.value)

  if (typeId.value && !entityTypes.value[typeId.value]) {
    await entityTypeStore.get(typeId.value)
  }

  isLoading.value = false
}

async function onDuplicate () {
  if (duplicateCount.value < 1) return

  isUpdating.value = true

  const ignoredProperties = Object.keys(selectedProperties.value).filter((propName) => !selectedProperties.value[propName])

  await apiDuplicateEntity(entityId.value, duplicateCount.value, ignoredProperties)

  // Close the drawer, parent will handle page refresh
  emit('close')
  isUpdating.value = false
}

async function onClose () {
  await until(isUpdating).not.toBeTruthy()
  emit('close')
}
</script>

<template>
  <my-drawer
    :is-loading="isLoading"
    :title="t('title', { name: entityName })"
    :width="500"
    @close="onClose()"
  >
    <div class="size-full overflow-auto">
      <div class="py-4">
        <!-- Number of copies -->
        <div class="mb-6 px-6">
          <h3 class="mb-3 font-medium text-gray-700">
            {{ t('numberOfCopies') }}
          </h3>
          <n-input-number
            v-model:value="duplicateCount"
            :min="1"
            :max="50"
            class="w-full"
            :disabled="isUpdating"
          />
        </div>

        <!-- Properties selection -->
        <div class="mb-6">
          <h3 class="mb-3 px-6 font-medium text-gray-700">
            {{ t('propertiesToInclude') }}
          </h3>

          <div
            v-for="property in availableProperties"
            :key="property.name"
            class="hover:bg-gray-50"
          >
            <div class="flex items-start gap-3 px-6 py-2">
              <n-checkbox
                v-model:checked="selectedProperties[property.name]"
                :disabled="isUpdating"
                class="mt-0.5"
              />

              <div class="flex-1 pb-2">
                <div
                  class="flex cursor-default items-center gap-2"
                  @click="selectedProperties[property.name] = !selectedProperties[property.name]"
                >
                  <span class="font-medium">
                    {{ property.label }}
                  </span>
                </div>

                <!-- Preview of values -->
                <div class="mt-1 flex flex-wrap gap-1">
                  <span
                    v-for="(value, index) in property.values.slice(0, 3)"
                    :key="index"
                    class="max-w-[300px] truncate rounded bg-gray-100 px-2 py-0.5 text-xs"
                  >
                    {{ value.string || value.reference || value.filename || value.datetime }}
                  </span>
                  <span
                    v-if="property.values.length > 3"
                    class="px-2 py-0.5 text-xs text-gray-500"
                  >
                    +{{ property.values.length - 3 }} {{ t('more') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <n-button
        type="primary"
        :loading="isUpdating"
        :disabled="isLoading || duplicateCount < 1"
        @click="onDuplicate()"
      >
        {{ duplicateCount === 1 ? t('createDuplicate') : t('createDuplicates', { count: duplicateCount }) }}
      </n-button>
    </template>
  </my-drawer>
</template>

<i18n lang="yaml">
en:
  title: "Duplicate - {name}"
  numberOfCopies: "Number of duplicates"
  propertiesToInclude: "Properties to include in duplicates"
  more: "more"
  createDuplicate: "Create Duplicate"
  createDuplicates: "Create {count} Duplicates"
et:
  title: "Dubleeri - {name}"
  numberOfCopies: "Koopiate arv"
  propertiesToInclude: "Parameetrid, mis lisada koopiatesse"
  more: "veel"
  createDuplicate: "Loo koopia"
  createDuplicates: "Loo {count} koopiat"
</i18n>
