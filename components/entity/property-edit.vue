<script setup>
import { NInput, NInputNumber, NSelect, NSwitch } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: undefined },
  property: { type: String, default: undefined },
  type: { type: String, default: undefined },
  decimals: { type: Number, default: 0 },
  isMultilingual: { type: Boolean, default: false },
  values: { type: Array, default: () => [] }
})

const oldValues = ref([])
const newValues = ref([])

const languageOptions = [
  { value: 'en', label: 'EN' },
  { value: 'et', label: 'ET' }
]

watch(() => props.values, (values) => {
  oldValues.value = structuredClone(toRaw(values))
  newValues.value = structuredClone(toRaw(values))
}, { deep: true, immediate: true })

function updateValue (newValue) {
  const _id = newValue._id
  const language = newValue.language
  let value = null

  switch (props.type) {
    case 'string':
      newValue.string = newValue.string?.trim() || ''
      value = newValue.string || null
      break
    case 'text':
      newValue.string = newValue.string?.trim() || ''
      value = newValue.string || null
      break
    case 'number':
      value = newValue.number
      break
    case 'boolean':
      value = newValue.boolean || null
      break
    case 'reference':
      value = newValue.reference
      break
    case 'date':
      value = newValue.date
      break
    case 'datetime':
      value = newValue.datetime
      break
  }

  if (value !== null && !_id) {
    addValue(value, language)
  } else if (value !== null && _id) {
    editValue(_id, value, language)
  } else if (value === null && _id) {
    deleteValue(_id)
  }
}

function addValue (value, language) {
  console.log('add', value, language)
}

function editValue (_id, value, language) {
  console.log('edit', _id, value, language)
}

function deleteValue (_id) {
  console.log('delete', _id)
}
</script>

<template>
  <div class="w-full flex flex-col items-start gap-1">
    <div
      v-for="value in newValues"
      :key="value._id"
      class="w-full flex flex-row items-center justify-between gap-1"
    >
      <n-input
        v-if="type === 'string'"
        v-model:value="value.string"
        clearable
        placeholder=""
        @blur="updateValue(value)"
      />

      <n-input
        v-if="type === 'text'"
        v-model:value="value.string"
        placeholder=""
        type="textarea"
        :autosize="{
          minRows: 3,
          maxRows: 15
        }"
        @blur="updateValue(value)"
      />

      <n-input-number
        v-if="type === 'number'"
        v-model:value="value.number"
        class="w-full"
        clearable
        placeholder=""
        :precision="decimals"
        @blur="updateValue(value)"
      />

      <div
        v-if="type === 'boolean'"
        class="w-full"
      >
        <n-switch
          v-model:value="value.boolean"
          @update:value="updateValue(value)"
        />
      </div>

      <n-select
        v-if="isMultilingual"
        v-model:value="value.language"
        class="!w-20 self-start"
        clearable
        placeholder=""
        :options="languageOptions"
        @update:value="updateValue(value)"
      />
    </div>
  </div>
</template>
