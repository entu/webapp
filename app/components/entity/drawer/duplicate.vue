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
const ignoredProperties = ref([])

const typeId = computed(() => getValue(rawEntity.value?._type, 'reference'))
const entityType = computed(() => entityTypes.value?.[typeId.value] || {})
const entityName = computed(() => getValue(rawEntity.value?.name))
const selectedCount = computed(() => availableProperties.value.length - ignoredProperties.value.length)

const availableProperties = computed(() => {
  if (!rawEntity.value) return []

  const result = []

  for (const property in rawEntity.value) {
    if (property.startsWith('_')) continue
    if (!rawEntity.value[property]?.length) continue

    const propertyDef = entityType.value?.props?.find((p) => p.name === property) || {}

    // Skip formula properties
    if (propertyDef?.formula) continue

    result.push({
      name: property,
      label: propertyDef?.label || property,
      values: rawEntity.value[property],
      ordinal: propertyDef?.ordinal || 0,
      type: propertyDef?.type
    })
  }

  return result.sort((a, b) => {
    // Sort by ordinal first
    if (a.ordinal !== b.ordinal) {
      return a.ordinal - b.ordinal
    }
    // If ordinals are equal, sort alphabetically
    return a.label.localeCompare(b.label)
  })
})

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

  // Reset ignored properties and add file properties (since backend ignores them anyway)
  ignoredProperties.value = availableProperties.value
    .filter((prop) => prop.type === 'file')
    .map((prop) => prop.name)

  isLoading.value = false
}

async function onDuplicate () {
  if (duplicateCount.value < 1) return

  isUpdating.value = true

  await apiDuplicateEntity(entityId.value, duplicateCount.value, ignoredProperties.value)

  emit('close')
  isUpdating.value = false
}

async function onClose () {
  emit('close')
}

function toggleProperty (propertyName) {
  if (ignoredProperties.value.includes(propertyName)) {
    // Remove from ignored array (include the property)
    ignoredProperties.value = ignoredProperties.value.filter((p) => p !== propertyName)
  }
  else {
    // Add to ignored array (ignore the property)
    ignoredProperties.value.push(propertyName)
  }
}

function isPropertyDisabled (property) {
  return isUpdating.value || property.type === 'file' || (!ignoredProperties.value.includes(property.name) && selectedCount.value === 1)
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

        <h3 class="px-6 font-medium text-gray-700">
          {{ t('propertiesToInclude') }}
        </h3>

        <div
          v-for="property in availableProperties"
          :key="property.name"
          class="hover:bg-gray-50"
        >
          <div class="px-6 py-2">
            <n-checkbox
              :checked="!ignoredProperties.includes(property.name)"
              :disabled="isPropertyDisabled(property)"
              :label="property.label"
              class="mt-0.5"
              @update:checked="() => toggleProperty(property.name)"
            />

            <div
              class="mb-2 ml-6 mt-1 flex flex-wrap gap-1"
              :class="{ 'opacity-50': isPropertyDisabled(property) }"
            >
              <span
                v-for="(value, index) in property.values.slice(0, 3)"
                :key="index"
                class="max-w-[300px] truncate rounded bg-gray-100 px-2 py-0.5 text-xs"
              >
                {{ value.string || value.number || value.filename || value.date || value.datetime || value.boolean }}
              </span>

              <span
                v-if="property.values.length > 3"
                class="px-2 py-0.5 text-xs text-gray-500"
              >
                {{ t('more', { count: property.values.length - 3 }) }}
              </span>
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
  more: "+{count} more"
  createDuplicate: "Create Duplicate"
  createDuplicates: "Create {count} Duplicates"
et:
  title: "Dubleeri - {name}"
  numberOfCopies: "Koopiate arv"
  propertiesToInclude: "Parameetrid, mis lisada koopiatesse"
  more: "+{count} veel"
  createDuplicate: "Loo koopia"
  createDuplicates: "Loo {count} koopiat"
</i18n>
