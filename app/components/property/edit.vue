<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NDatePicker, NInput, NInputNumber, NSelect, NSwitch, NUpload, NUploadTrigger, NUploadFileList } from 'naive-ui'
import { apiDeleteProperty } from '~/utils/api'

const entityId = defineModel('entityId', { type: String, default: undefined })
const entityParentId = defineModel('entityParentId', { type: String, default: undefined })
const entityTypeId = defineModel('entityTypeId', { type: String, default: undefined })
const isUpdating = defineModel('updating', { type: Boolean, default: false })

const props = defineProps({
  decimals: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
  isList: { type: Boolean, default: false },
  isMultilingual: { type: Boolean, default: false },
  property: { type: String, default: undefined },
  referenceQuery: { type: String, default: undefined },
  set: { type: Array, default: () => [] },
  type: { type: String, default: undefined },
  values: { type: Array, default: () => [] }
})

const { locale, t } = useI18n()
const { accountId } = useAccount()

const newFiles = ref({})

const oldValues = ref()
const newValues = ref()
const loadingInputs = ref([])

watch(() => props.values, () => {
  oldValues.value = cloneData(props.values.map((x) => {
    if (x.date) x.date = new Date(x.date).getTime()
    if (x.datetime) x.datetime = new Date(x.datetime).getTime()

    return x
  }))

  newValues.value = cloneData(oldValues.value)

  // For multilingual properties, ensure we have empty fields for each language
  if (props.isMultilingual) {
    const existingLanguages = newValues.value
      .filter(x => x._id !== undefined)
      .map(x => x.language)

    // Add empty values for missing languages
    languageOptions.forEach(langOption => {
      const hasLanguage = newValues.value.some(x => x.language === langOption.value)
      if (!hasLanguage) {
        newValues.value.push({ language: langOption.value })
      }
    })
  }
}, { immediate: true, deep: true })

const languageOptions = [
  { value: 'en', label: 'EN' },
  { value: 'et', label: 'ET' }
]

const setOptions = computed(() => props.set.map((x) => ({ value: x, label: x })).sort())
const referenceOptions = computed(() => props.values.filter((x) => x._id !== undefined).map((x) => ({ value: x.reference, label: x.string })))

const fileList = computed(() => props.type === 'file'
  ? newValues.value.filter((x) => x._id !== undefined).map((x) => ({
      id: x._id,
      name: x.filename,
      url: `/${accountId.value}/file/${x._id}`,
      status: 'finished'
    }))
  : []
)

async function updateValue (newValue) {
  const oldValue = oldValues.value.find((x) => x._id === newValue._id) || {}

  const _id = newValue._id
  const language = newValue.language
  const properties = []
  let property = null
  let value = null

  switch (props.type) {
    case 'text':
      property = 'string'
      break
    case 'counter':
      property = 'string'
      break
    case 'file':
      property = 'filename'
      break
    default:
      property = props.type
      break
  }

  value = newValue[property]

  if (typeof value === 'string') {
    value = value.trim() || null
  }
  if (oldValue[property] instanceof Date) {
    value = new Date(value) || null
  }

  if (!newValue.counter && value === oldValue[property] && language === oldValue.language) return

  if (!_id && (value === null || value === undefined || value === '')) return

  loadingInputs.value.push(_id)
  isUpdating.value = true

  switch (props.type) {
    case 'file':
      properties.push({
        _id,
        type: props.property,
        filename: newValue.filename,
        filesize: newValue.filesize,
        filetype: newValue.filetype,
        language
      })
      break
    case 'counter':
      properties.push({
        _id,
        type: props.property,
        [property]: value,
        counter: 1,
        language
      })
      break
    default:
      properties.push({
        _id,
        type: props.property,
        [property]: value,
        language
      })
      break
  }

  let entity

  if (!entityId.value && value !== null && !_id) {
    entity = await addEntity(properties)
  }
  else if (entityId.value && value !== null && !_id) {
    entity = await addValue(properties)
  }
  else if (entityId.value && value !== null && _id) {
    entity = await editValue(_id, properties)
  }
  else if (entityId.value && value === null && _id) {
    entity = await deleteValue(_id)
  }

  syncValues()
  addListValue(_id)

  isUpdating.value = false
  loadingInputs.value.splice(loadingInputs.value.indexOf(_id), 1)

  return entity
}

async function addEntity (properties) {
  if (entityParentId.value) {
    properties.push({
      type: '_parent',
      reference: entityParentId.value
    })
  }

  if (entityTypeId.value) {
    properties.push({
      type: '_type',
      reference: entityTypeId.value
    })
  }

  const entity = await apiUpsertEntity(undefined, properties)

  entityId.value = entity._id

  return entity
}

async function addValue (properties) {
  const entity = await apiUpsertEntity(entityId.value, properties)

  const property = entity.properties.find((x) => x.type === props.property)
  const newValue = newValues.value.find((x) => x._id === undefined)

  newValue._id = property._id

  if (props.type === 'counter') {
    newValue.string = property.string
  }

  return entity
}

async function editValue (_id, properties) {
  const entity = await apiUpsertEntity(entityId.value, properties)

  if (entity?.properties) {
    const property = entity.properties.find((x) => x.type === props.property)
    const newValue = newValues.value.find((x) => x._id === _id)

    newValue._id = property._id
  }
  else {
    newValues.value = newValues.value.filter((x) => x._id !== _id)
  }

  if (newValues.value.length === 0) {
    newValues.value = [{}]
  }

  return entity
}

async function deleteValue (_id) {
  await apiDeleteProperty(_id)

  const newValue = newValues.value.find((x) => x._id === _id)

  delete newValue._id
}

async function uploadFile ({ file, onProgress, onFinish, onError }) {
  if (!file?.file) {
    onError()
    return
  }

  const entity = await updateValue({
    filename: file.file.name,
    filesize: file.file.size,
    filetype: file.file.type || 'application/octet-stream'
  })

  const property = entity.properties.find((x) => x.type === props.property)

  if (!property) {
    onError()
    return
  }

  const sendForm = property.upload

  const request = new XMLHttpRequest()
  request.open(sendForm.method, sendForm.url)

  for (const header in sendForm.headers) {
    request.setRequestHeader(header, sendForm.headers[header])
  }

  request.upload.addEventListener('progress', function (e) {
    const percent = (e.loaded / e.total) * 100
    onProgress({ percent })
  })

  request.addEventListener('load', function (e) {
    if (request.status === 200) {
      file._id = property._id
      file.url = `/${accountId.value}/file/${property._id}`

      newFiles.value[file.id] = property._id

      onFinish()
    }
    else {
      onError()
    }
  })

  request.send(file.file)
}

async function deleteFile (file) {
  isUpdating.value = true

  if (newFiles.value[file.id]) {
    await deleteValue(newFiles.value[file.id])

    delete newFiles.value[file.id]
  }
  else {
    await deleteValue(file.id)
  }

  isUpdating.value = false

  syncValues()
}

function syncValues () {
  oldValues.value = cloneData(newValues.value)
}

function addListValue (_id) {
  // For multilingual properties (both list and non-list), ensure all languages have empty fields
  if (props.isMultilingual) {
    languageOptions.forEach(langOption => {
      const hasEmptyForLanguage = newValues.value.some(x =>
        x._id === undefined && x.language === langOption.value
      )

      if (!hasEmptyForLanguage) {
        newValues.value.push({ language: langOption.value })
      }
    })

    // For non-list multilingual properties, we're done
    if (!props.isList) return
    return
  }

  // For non-multilingual properties, only proceed if it's a list
  if (!props.isList) return

  // For non-multilingual list properties
  const emptyCount = newValues.value.filter((x) => x._id === undefined).length

  // Don't add more than one empty value at a time
  if (emptyCount >= 1) return

  // Add empty value only if none exists
  newValues.value.push({})
}
</script>

<template>
  <div class="flex w-full flex-col items-start gap-1">
    <div
      v-if="type === 'file'"
      class="w-full"
    >
      <n-upload
        abstract
        :multiple="isList"
        :default-file-list="fileList"
        :show-cancel-button="false"
        :custom-request="uploadFile"
        @remove="({ file }) => deleteFile(file)"
      >
        <n-upload-file-list
          v-if="fileList.length > 0"
          class="w-full text-sm"
        />

        <n-upload-trigger
          #="{ handleClick }"
          abstract
        >
          <my-button
            v-if="isList || !isList && fileList.length === 0"
            :disabled="disabled"
            :label="t('upload')"
            @click="handleClick"
          />
        </n-upload-trigger>
      </n-upload>
    </div>

    <div
      v-for="value in newValues"
      v-else
      :key="value._id"
      class="flex w-full flex-row items-center justify-between gap-1"
    >
      <n-select
        v-if="isMultilingual"
        v-model:value="value.language"
        class="!w-20 self-start"
        placeholder=""
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        :options="languageOptions"
        @update:value="updateValue(value)"
      />

      <n-input
        v-if="type === 'string' && set.length === 0"
        v-model:value="value.string"
        placeholder=""
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @blur="updateValue(value)"
        @focus="addListValue(value._id)"
      />

      <n-select
        v-else-if="type === 'string' && set.length > 0"
        v-model:value="value.string"
        placeholder=""
        :loading="loadingInputs.includes(value._id)"
        :options="setOptions"
        :readonly="disabled"
        @update:value="updateValue(value)"
        @focus="addListValue(value._id)"
      />

      <n-input
        v-else-if="type === 'text'"
        v-model:value="value.string"
        placeholder=""
        type="textarea"
        :autosize="{
          minRows: 3,
          maxRows: 15,
        }"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @blur="updateValue(value)"
        @focus="addListValue(value._id)"
      />

      <n-input-number
        v-else-if="type === 'number'"
        v-model:value="value.number"
        class="w-full"
        clearable
        placeholder=""
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        :precision="decimals"
        :format="value => value?.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })"
        :parse="value => parseFloat(value?.replace(/,/g, '.'))"
        @blur="updateValue(value)"
        @focus="addListValue(value._id)"
      />

      <div
        v-else-if="type === 'boolean'"
        class="w-full"
      >
        <n-switch
          v-model:value="value.boolean"
          :loading="loadingInputs.includes(value._id)"
          :readonly="disabled"
          :unchecked-value="null"
          @update:value="updateValue(value)"
        />
      </div>

      <n-date-picker
        v-else-if="type === 'date'"
        v-model:value="value.date"
        class="w-full"
        placeholder=""
        type="date"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @update:value="updateValue(value)"
      />

      <n-date-picker
        v-else-if="type === 'datetime'"
        v-model:value="value.datetime"
        class="w-full"
        placeholder=""
        type="datetime"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @update:value="updateValue(value)"
      />

      <my-select-reference
        v-else-if="type === 'reference'"
        v-model="value.reference"
        placeholder=""
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        :query="referenceQuery"
        :options="referenceOptions"
        @focus="addListValue(value._id)"
        @update:value="updateValue(value)"
      />

      <n-input
        v-else-if="type === 'counter' && value.string"
        v-model:value="value.string"
        placeholder=""
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @blur="updateValue(value)"
        @focus="addListValue(value._id)"
      />

      <my-button
        v-else-if="type === 'counter' && !value._id"
        :label="t('counter')"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @click="updateValue({ counter: 1 })"
      />
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    upload: Upload
    counter: Generate
  et:
    upload: Laadi üles
    counter: Genereeri
</i18n>
