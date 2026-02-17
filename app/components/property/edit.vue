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
const { userId } = useUser()

const newFiles = ref({})

const oldValues = ref()
const newValues = ref()
const loadingInputs = ref([])

const languageOptions = [
  { value: 'en', label: 'EN' },
  { value: 'et', label: 'ET' }
]

const setOptions = computed(() => [...props.set].sort().map((x) => ({ value: x, label: x })))
const referenceOptions = computed(() => props.values.filter((x) => x._id !== undefined).map((x) => ({ value: x.reference, label: x.string })))
const isOwnEntity = computed(() => userId.value === entityId.value)

const fileList = computed(() => props.type === 'file'
  ? newValues.value.filter((x) => x._id !== undefined).map((x) => ({
      id: x._id,
      name: x.filename,
      url: `/${accountId.value}/file/${x._id}`,
      status: 'finished'
    }))
  : []
)

watch(() => props.values, () => {
  oldValues.value = cloneData(props.values.map((x) => {
    if (x.date) x.date = new Date(x.date).getTime()
    if (x.datetime) x.datetime = new Date(x.datetime).getTime()

    return x
  }))

  newValues.value = cloneData(oldValues.value)

  manageEmptyFields()
}, { immediate: true, deep: true })

function manageEmptyFields () {
  if (props.isMultilingual) {
    languageOptions.forEach((langOption) => {
      const hasExistingValue = newValues.value.some((x) => x._id !== undefined && x.language === langOption.value)
      const emptyFieldsForLanguage = newValues.value.filter((x) =>
        x._id === undefined && x.language === langOption.value
      )

      if (props.isList) {
        // List: always need exactly one empty field per language
        if (emptyFieldsForLanguage.length === 0) {
          newValues.value.push({ language: langOption.value })
        }
        else if (emptyFieldsForLanguage.length > 1) {
          // Remove extra empty fields, keep only the first one
          emptyFieldsForLanguage.slice(1).forEach((field) => {
            const index = newValues.value.indexOf(field)
            if (index > -1) newValues.value.splice(index, 1)
          })
        }
      }
      else {
        // Non-list: only show one empty field if no existing value for this language
        if (!hasExistingValue && emptyFieldsForLanguage.length === 0) {
          newValues.value.push({ language: langOption.value })
        }
        else if (hasExistingValue && emptyFieldsForLanguage.length > 0) {
          // Remove empty fields for languages that have existing values
          emptyFieldsForLanguage.forEach((field) => {
            const index = newValues.value.indexOf(field)
            if (index > -1) newValues.value.splice(index, 1)
          })
        }
        else if (!hasExistingValue && emptyFieldsForLanguage.length > 1) {
          // Keep only one empty field for languages without existing values
          emptyFieldsForLanguage.slice(1).forEach((field) => {
            const index = newValues.value.indexOf(field)
            if (index > -1) newValues.value.splice(index, 1)
          })
        }
      }
    })
  }
  else {
    const emptyFields = newValues.value.filter((x) => x._id === undefined)
    const hasExistingValue = newValues.value.some((x) => x._id !== undefined)

    if (props.isList) {
      // List: always need exactly two empty fields
      if (emptyFields.length < 2) {
        const fieldsToAdd = 2 - emptyFields.length
        for (let i = 0; i < fieldsToAdd; i++) {
          newValues.value.push({})
        }
      }
      else if (emptyFields.length > 2) {
        // Remove extra empty fields, keep only the first two
        emptyFields.slice(2).forEach((field) => {
          const index = newValues.value.indexOf(field)
          if (index > -1) newValues.value.splice(index, 1)
        })
      }
    }
    else {
      // Non-list: only show one empty field if no existing value
      if (!hasExistingValue && emptyFields.length === 0) {
        newValues.value.push({})
      }
      else if (hasExistingValue && emptyFields.length > 0) {
        // Remove empty fields when there are existing values
        emptyFields.forEach((field) => {
          const index = newValues.value.indexOf(field)
          if (index > -1) newValues.value.splice(index, 1)
        })
      }
      else if (!hasExistingValue && emptyFields.length > 1) {
        // Keep only one empty field when no existing values
        emptyFields.slice(1).forEach((field) => {
          const index = newValues.value.indexOf(field)
          if (index > -1) newValues.value.splice(index, 1)
        })
      }
    }
  }
}

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

  if (props.type !== 'counter' && value === oldValue[property] && language === oldValue.language) return

  // Handle language change on empty field for multilingual properties
  if (props.isMultilingual && !_id && (value === null || value === undefined || value === '') && language !== oldValue.language) {
    // Just update the language locally, no API call needed
    manageEmptyFields()
    return
  }

  if (props.type !== 'counter' && !_id && (value === null || value === undefined || value === '')) return

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
  manageEmptyFields()

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

  if (props.property === 'entu_api_key') {
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

async function copyToClipboard (text) {
  await navigator.clipboard.writeText(text)
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

      <my-button
        v-if="type === 'string' && props.property === 'entu_passkey' && value._id"
        icon="delete"
        :label="t('deletePasskey')"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @click="updateValue({ ...value, string: null })"
      />

      <my-button
        v-else-if="type === 'string' && props.property === 'entu_passkey' && !value._id && isOwnEntity"
        icon="add"
        :label="t('registerPasskey')"
        :readonly="disabled"
        @click="navigateTo(`/${accountId}/passkey`)"
      />

      <span
        v-else-if="type === 'string' && props.property === 'entu_passkey' && !value._id && !isOwnEntity"
        class="mt-2 text-sm text-gray-500"
      >
        {{ t('passkeyOwnOnly') }}
      </span>

      <my-button
        v-else-if="type === 'string' && props.property === 'entu_api_key' && value._id && value.string === '***'"
        icon="delete"
        :label="t('deleteApiKey')"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @click="updateValue({ ...value, string: null })"
      />

      <template v-else-if="type === 'string' && props.property === 'entu_api_key' && value._id && value.string !== '***'">
        <n-input
          v-model:value="value.string"
          placeholder=""
          readonly
          :loading="loadingInputs.includes(value._id)"
        />
        <my-button
          icon="copy"
          @click="copyToClipboard(value.string)"
        />
      </template>

      <my-button
        v-else-if="type === 'string' && props.property === 'entu_api_key' && !value._id"
        icon="add"
        :label="t('generateApiKey')"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @click="updateValue({ ...value, string: 'generate' })"
      />

      <n-input
        v-else-if="type === 'string' && set.length === 0"
        v-model:value="value.string"
        placeholder=""
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @blur="updateValue(value)"
        @update:value="manageEmptyFields()"
      />

      <n-select
        v-else-if="type === 'string' && set.length > 0"
        v-model:value="value.string"
        clearable
        placeholder=""
        :loading="loadingInputs.includes(value._id)"
        :options="setOptions"
        :readonly="disabled"
        @update:value="updateValue(value)"
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
        @update:value="manageEmptyFields()"
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
        @update:value="manageEmptyFields()"
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
        @update:value="updateValue(value)"
      />

      <n-input
        v-else-if="type === 'counter' && value._id"
        v-model:value="value.string"
        placeholder=""
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @blur="updateValue(value)"
        @update:value="manageEmptyFields()"
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
    generateApiKey: Generate API Key
    deleteApiKey: Delete API Key
    deletePasskey: Delete Passkey
    registerPasskey: Register Passkey
    passkeyOwnOnly: Only user can create their own passkey
  et:
    upload: Laadi üles
    counter: Genereeri
    generateApiKey: Loo API võti
    deleteApiKey: Kustuta API võti
    deletePasskey: Kustuta turvavõti
    registerPasskey: Registreeri turvavõti
    passkeyOwnOnly: Turvavõtit saab luua ainult kasutaja ise
</i18n>
