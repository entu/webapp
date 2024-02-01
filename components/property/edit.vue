<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NDatePicker, NInput, NInputNumber, NSelect, NSwitch, NUpload, NUploadTrigger, NUploadFileList } from 'naive-ui'

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

const { t } = useI18n()
const { accountId } = useAccount()

const newFiles = ref({})

const oldValues = ref()
const newValues = ref()

watch(() => props.values, () => {
  oldValues.value = cloneArray(props.values.map((x) => {
    if (x.date) x.date = new Date(x.date).getTime()
    if (x.datetime) x.datetime = new Date(x.datetime).getTime()

    return x
  }))

  newValues.value = cloneArray(oldValues.value)
}, { immediate: true, deep: true })

const languageOptions = [
  { value: 'en', label: 'EN' },
  { value: 'et', label: 'ET' }
]

const setOptions = computed(() => props.set.map(x => ({ value: x, label: x })).sort())
const referenceOptions = computed(() => props.values.filter(x => x._id !== undefined).map(x => ({ value: x.reference, label: x.string })))

const fileList = computed(() => props.type === 'file'
  ? newValues.value.filter(x => x._id !== undefined).map(x => ({
    id: x._id,
    name: x.filename,
    url: `/${accountId.value}/file/${x._id}`,
    status: 'finished'
  }))
  : []
)

async function updateValue (newValue) {
  const oldValue = oldValues.value.find(x => x._id === newValue._id) || {}

  const _id = newValue._id
  const language = newValue.language
  const properties = []
  let property = null
  let value = null

  switch (props.type) {
    case 'text':
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

  if (value === oldValue[property] && language === oldValue.language) return

  isUpdating.value = true

  if (props.type === 'file') {
    properties.push({
      type: props.property,
      filename: newValue.filename,
      filesize: newValue.filesize,
      filetype: newValue.filetype,
      language
    })
  } else {
    properties.push({
      type: props.property,
      [property]: value,
      language
    })
  }

  let entity

  if (!entityId.value && value !== null && !_id) {
    entity = await addEntity(properties)
  } else if (entityId.value && value !== null && !_id) {
    entity = await addValue(properties)
  } else if (entityId.value && value !== null && _id) {
    entity = await editValue(_id, properties, language)
  } else if (entityId.value && value === null && _id) {
    entity = await deleteValue(_id)
  }

  syncValues()
  addListValue(_id)

  isUpdating.value = false

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

  const entity = await apiUpsertEntity(
    undefined,
    undefined,
    properties
  )

  entityId.value = entity._id

  return entity
}

async function addValue (properties) {
  const entity = await apiUpsertEntity(
    entityId.value,
    undefined,
    properties
  )

  const property = entity.properties.find(x => x.type === props.property)
  const newValue = newValues.value.find(x => x._id === undefined)

  newValue._id = property._id

  return entity
}

async function editValue (_id, properties) {
  const entity = await apiUpsertEntity(
    entityId.value,
    _id,
    properties
  )

  if (entity?.properties) {
    const property = entity.properties.find(x => x.type === props.property)
    const newValue = newValues.value.find(x => x._id === _id)

    newValue._id = property._id
  } else {
    newValues.value = newValues.value.filter(x => x._id !== _id)
  }

  if (newValues.value.length === 0) {
    newValues.value = [{}]
  }

  return entity
}

async function deleteValue (_id) {
  const entity = await apiUpsertEntity(
    entityId.value,
    _id
  )

  if (entity?.properties) return

  newValues.value = newValues.value.filter(x => x._id !== _id)

  if (newValues.value.length === 0) {
    newValues.value = [{}]
  }

  return entity
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

  const property = entity.properties.find(x => x.type === props.property)

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
    } else {
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
  } else {
    await deleteValue(file.id)
  }

  isUpdating.value = false

  syncValues()
}

function syncValues () {
  oldValues.value = cloneArray(newValues.value)
}

function addListValue (_id) {
  if (!props.isList) return

  if (newValues.value.filter(x => x._id === undefined).length >= 2) return

  if (!newValues.value.some(x => x._id === undefined)) {
    newValues.value.push({})
  }

  if (_id === undefined) {
    newValues.value.push({})
  }
}
</script>

<template>
  <div class="w-full flex flex-col items-start gap-1">
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

        <n-upload-trigger #="{ handleClick }" abstract>
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
      class="w-full flex flex-row items-center justify-between gap-1"
    >
      <n-input
        v-if="type === 'string' && set.length === 0"
        v-model:value="value.string"
        placeholder=""
        :readonly="disabled"
        @blur="updateValue(value)"
        @focus="addListValue(value._id)"
      />

      <n-select
        v-else-if="type === 'string' && set.length > 0"
        v-model:value="value.string"
        placeholder=""
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
          maxRows: 15
        }"
        :readonly="disabled"
        @blur="updateValue(value)"
        @focus="addListValue(value._id)"
      />

      <n-input-number
        v-else-if="type === 'number'"
        v-model:value="value.number"
        class="w-full"
        placeholder=""
        :readonly="disabled"
        :precision="decimals"
        @blur="updateValue(value)"
        @focus="addListValue(value._id)"
      />

      <div
        v-else-if="type === 'boolean'"
        class="w-full"
      >
        <n-switch
          v-model:value="value.boolean"
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
        :readonly="disabled"
        @update:value="updateValue(value)"
      />

      <n-date-picker
        v-else-if="type === 'datetime'"
        v-model:value="value.date"
        class="w-full"
        placeholder=""
        type="datetime"
        :readonly="disabled"
        @update:value="updateValue(value)"
      />

      <my-select-reference
        v-else-if="type === 'reference'"
        v-model="value.reference"
        placeholder=""
        :readonly="disabled"
        :query="referenceQuery"
        :values="referenceOptions"
        @focus="addListValue(value._id)"
        @update:value="updateValue(value)"
      />

      <n-select
        v-if="isMultilingual"
        v-model:value="value.language"
        class="!w-20 self-start"
        placeholder=""
        :readonly="disabled"
        :options="languageOptions"
        @update:value="updateValue(value)"
      />
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    upload: Upload
  et:
    upload: Laadi üles
</i18n>
