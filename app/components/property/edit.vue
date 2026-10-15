<script setup>
import { NDatePicker, NInput, NInputNumber, NSelect, NSwitch, NUpload, NUploadTrigger, NUploadFileList } from 'naive-ui'

const entityId = defineModel('entityId', { type: String, default: undefined })
const entityParentId = defineModel('entityParentId', { type: String, default: undefined })
const entityTypeId = defineModel('entityTypeId', { type: String, default: undefined })
const isUpdating = defineModel('isUpdating', { type: Boolean, default: false })

const props = defineProps({
  decimals: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
  isList: { type: Boolean, default: false },
  isMultilingual: { type: Boolean, default: false },
  label: { type: String, default: undefined },
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

// The property label names every field, as the visible label sits outside this component and naive-ui fields can't point at it.
const inputProps = computed(() => ({ 'aria-label': props.label }))

const fileList = computed(() => props.type === 'file'
  ? newValues.value.filter((x) => x._id !== undefined).map((x) => ({
    id: x._id,
    name: x.filename,
    url: `/${accountId.value}/file/${x._id}`,
    status: 'finished'
  }))
  : []
)

const uploadKey = computed(() => fileList.value.map((x) => x.id).join('|') || '0')

watch(() => props.values, () => {
  oldValues.value = cloneData(props.values.map((x) => {
    if (x.date) {
      x.date = new Date(x.date).getTime()
    }
    if (x.datetime) {
      x.datetime = new Date(x.datetime).getTime()
    }

    return x
  }))

  newValues.value = cloneData(oldValues.value)

  manageEmptyFields()
}, { immediate: true, deep: true })

function isEmptyValue (value) {
  return isEmptyPropertyValue(value, props.type)
}

function manageEmptyFields () {
  if (props.isMultilingual) {
    for (const langOption of languageOptions) {
      const hasExistingValue = newValues.value.some((x) => x._id !== undefined && x.language === langOption.value)
      const emptyFieldsForLanguage = newValues.value.filter((x) =>
        x._id === undefined && x.language === langOption.value
      )

      if (props.isList) {
        // List: keep exactly one empty (no-content) field per language
        const emptyContentFields = newValues.value.filter((x) => isEmptyValue(x) && x.language === langOption.value)

        if (emptyContentFields.length === 0) {
          newValues.value.push({ language: langOption.value })
        }
        else if (emptyContentFields.length > 1) {
          // Remove extra empty fields, keep only the first one
          for (const field of emptyContentFields.slice(1)) {
            const index = newValues.value.indexOf(field)
            if (index > -1) {
              newValues.value.splice(index, 1)
            }
          }
        }
      }
      else {
        // Non-list: only show one empty field if no existing value for this language
        if (!hasExistingValue && emptyFieldsForLanguage.length === 0) {
          newValues.value.push({ language: langOption.value })
        }
        else if (hasExistingValue && emptyFieldsForLanguage.length > 0) {
          // Remove empty fields for languages that have existing values
          for (const field of emptyFieldsForLanguage) {
            const index = newValues.value.indexOf(field)
            if (index > -1) {
              newValues.value.splice(index, 1)
            }
          }
        }
        else if (!hasExistingValue && emptyFieldsForLanguage.length > 1) {
          // Keep only one empty field for languages without existing values
          for (const field of emptyFieldsForLanguage.slice(1)) {
            const index = newValues.value.indexOf(field)
            if (index > -1) {
              newValues.value.splice(index, 1)
            }
          }
        }
      }
    }
  }
  else {
    if (props.isList) {
      // List: keep exactly one empty (no-content) field
      const emptyFields = newValues.value.filter((x) => isEmptyValue(x))

      if (emptyFields.length === 0) {
        newValues.value.push({})
      }
      else if (emptyFields.length > 1) {
        // Remove extra empty fields, keep only the first one
        for (const field of emptyFields.slice(1)) {
          const index = newValues.value.indexOf(field)
          if (index > -1) {
            newValues.value.splice(index, 1)
          }
        }
      }
    }
    else {
      const emptyFields = newValues.value.filter((x) => x._id === undefined)
      const hasExistingValue = newValues.value.some((x) => x._id !== undefined)

      // Non-list: only show one empty field if no existing value
      if (!hasExistingValue && emptyFields.length === 0) {
        newValues.value.push({})
      }
      else if (hasExistingValue && emptyFields.length > 0) {
        // Remove empty fields when there are existing values
        for (const field of emptyFields) {
          const index = newValues.value.indexOf(field)
          if (index > -1) {
            newValues.value.splice(index, 1)
          }
        }
      }
      else if (!hasExistingValue && emptyFields.length > 1) {
        // Keep only one empty field when no existing values
        for (const field of emptyFields.slice(1)) {
          const index = newValues.value.indexOf(field)
          if (index > -1) {
            newValues.value.splice(index, 1)
          }
        }
      }
    }
  }
}

async function updateValue (newValue) {
  const oldValue = oldValues.value.find((x) => x._id === newValue._id) || {}

  const _id = newValue._id
  const language = newValue.language
  const properties = []
  const property = propertyValueKey(props.type)
  let value = newValue[property]

  if (typeof value === 'string') {
    value = value.trim() || null
  }
  if (oldValue[property] instanceof Date) {
    value = new Date(value)
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

  if (property.filename) {
    newValue.filename = property.filename
  }

  if (props.type === 'counter') {
    newValue.string = property.string
  }

  if (props.property === 'entu_api_key') {
    newValue.string = property.string
  }
  else if (props.property === 'entu_user') {
    newValue.invite = property.invite
    newValue.string = property.string

    // The real token comes back only on your own person, where it opens the invite page to add a login method
    if (isOwnEntity.value && typeof property.invite === 'string') {
      await navigateTo({ path: `/${accountId.value}/invite`, query: { token: property.invite } })
    }
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

  try {
    await uploadBlob(file.file, property.upload, onProgress)

    file._id = property._id
    file.url = `/${accountId.value}/file/${property._id}`

    newFiles.value[file.id] = property._id

    onFinish()
  }
  catch {
    onError()
  }
}

async function deleteFile (file) {
  isUpdating.value = true

  if (newFiles.value[file.id]) {
    await deleteValue(newFiles.value[file.id])

    newFiles.value[file.id] = undefined
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

const { copy } = useClipboard()
</script>

<template>
  <div class="flex w-full flex-col items-start gap-1">
    <div
      v-if="type === 'file'"
      class="w-full"
    >
      <n-upload
        :key="uploadKey"
        abstract
        :custom-request="uploadFile"
        :default-file-list="fileList"
        :multiple="isList"
        :show-cancel-button="false"
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
        class="w-20! self-start"
        placeholder=""
        role="group"
        :aria-label="t('language')"
        :loading="loadingInputs.includes(value._id)"
        :options="languageOptions"
        :readonly="disabled"
        @update:value="updateValue(value)"
      />

      <my-button
        v-if="type === 'string' && props.property === 'entu_api_key' && value._id && value.string === '***'"
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
          :input-props="inputProps"
          :loading="loadingInputs.includes(value._id)"
        />
        <my-button
          hide-label
          icon="copy"
          :label="t('copyApiKey')"
          @click="copy(value.string)"
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

      <template v-else-if="type === 'string' && props.property === 'entu_user' && value._id && value.invite && value.string">
        <span class="text-sm text-slate-600 dark:text-slate-300">
          {{ t('invitePending', { email: value.string }) }}
        </span>
        <my-button
          icon="delete"
          :label="t('cancelInvite')"
          :loading="loadingInputs.includes(value._id)"
          :readonly="disabled"
          @click="updateValue({ ...value, string: null })"
        />
      </template>

      <template v-else-if="type === 'string' && props.property === 'entu_user' && value._id && !value.invite">
        <div class="flex min-w-0 grow items-center gap-2">
          <my-icon
            v-if="value.provider"
            :icon="value.provider"
          />
          <span class="truncate text-sm">{{ value.string }}</span>
        </div>
        <my-button
          hide-label
          icon="delete"
          :label="t('removeLoginMethod')"
          :loading="loadingInputs.includes(value._id)"
          :readonly="disabled"
          @click="updateValue({ ...value, string: null })"
        />
      </template>

      <my-button
        v-else-if="type === 'string' && props.property === 'entu_user' && !value._id && !isOwnEntity"
        icon="e-mail"
        :label="t('sendInvite')"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @click="updateValue({ ...value, string: 'send-invite' })"
      />

      <my-button
        v-else-if="type === 'string' && props.property === 'entu_user' && !value._id && isOwnEntity"
        icon="e-mail"
        :label="t('addLoginMethod')"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @click="updateValue({ ...value, string: 'self-invite' })"
      />

      <n-input
        v-else-if="type === 'string' && set.length === 0"
        v-model:value="value.string"
        placeholder=""
        :input-props="inputProps"
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
        role="group"
        :aria-label="label"
        :loading="loadingInputs.includes(value._id)"
        :options="setOptions"
        :readonly="disabled"
        @update:value="updateValue(value)"
      />

      <n-input
        v-else-if="type === 'text'"
        v-model:value="value.string"
        placeholder=""
        role="group"
        type="textarea"
        :aria-label="label"
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
        :format="value => value?.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })"
        :input-props="inputProps"
        :loading="loadingInputs.includes(value._id)"
        :parse="value => parseFloat(value?.replace(/,/g, '.'))"
        :precision="decimals"
        :readonly="disabled"
        @blur="updateValue(value)"
        @update:value="manageEmptyFields()"
      />

      <div
        v-else-if="type === 'boolean'"
        class="w-full"
      >
        <n-switch
          v-model:value="value.boolean"
          :aria-label="label"
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
        role="group"
        type="date"
        :aria-label="label"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @update:value="updateValue(value)"
      />

      <n-date-picker
        v-else-if="type === 'datetime'"
        v-model:value="value.datetime"
        class="w-full"
        placeholder=""
        role="group"
        type="datetime"
        :aria-label="label"
        :loading="loadingInputs.includes(value._id)"
        :readonly="disabled"
        @update:value="updateValue(value)"
      />

      <my-select-reference
        v-else-if="type === 'reference'"
        v-model="value.reference"
        placeholder=""
        :label="label"
        :loading="loadingInputs.includes(value._id)"
        :options="referenceOptions"
        :query="referenceQuery"
        :readonly="disabled"
        @update:value="updateValue(value)"
      />

      <n-input
        v-else-if="type === 'counter' && value._id"
        v-model:value="value.string"
        placeholder=""
        :input-props="inputProps"
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
    sendInvite: Send Invite
    cancelInvite: Cancel Invite
    invitePending: 'Invite sent to {email}'
    addLoginMethod: Add Login Method
    copyApiKey: Copy API Key
    removeLoginMethod: Remove Login Method
    language: Language
  et:
    upload: Laadi üles
    counter: Genereeri
    generateApiKey: Loo API võti
    deleteApiKey: Kustuta API võti
    sendInvite: Saada kutse
    cancelInvite: Tühista kutse
    invitePending: 'Kutse saadetud aadressile {email}'
    addLoginMethod: Lisa sisselogimisviis
    copyApiKey: Kopeeri API võti
    removeLoginMethod: Eemalda sisselogimisviis
    language: Keel
</i18n>
