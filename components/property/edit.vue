<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { NButton, NDatePicker, NInput, NInputNumber, NSelect, NSwitch, NUpload, NUploadTrigger, NUploadFileList } from 'naive-ui'

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

const referenceSearch = ref('')
const referenceLimit = ref(100)
const referenceCount = ref(null)
const rawReferences = ref(null)
const searchingReferences = ref(false)
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

const referenceOptions = computed(() => {
  if (rawReferences.value) {
    return rawReferences.value?.map(x => ({ value: x._id, label: getValue(x.name) || x._id, type: getValue(x._type) })) || []
  } else {
    return props.values.filter(x => x._id !== undefined).map(x => ({ value: x.reference, label: x.string })) || []
  }
})

const fileList = computed(() => props.type === 'file'
  ? newValues.value.filter(x => x._id !== undefined).map(x => ({
    id: x._id,
    name: x.filename,
    url: `/${accountId.value}/file/${x._id}`,
    status: 'finished'
  }))
  : []
)

watchDebounced(referenceSearch, async (value = '') => {
  rawReferences.value = null

  if (value === '') return

  searchingReferences.value = true
  referenceCount.value = null

  let filter = {
    q: value,
    props: [
      '_type.string',
      'name'
    ],
    sort: 'name.string',
    limit: referenceLimit.value
  }

  if (props.referenceQuery) {
    filter = { ...queryStringToObject(props.referenceQuery), ...filter }
  }

  const { entities, count } = await apiGetEntities(filter)

  rawReferences.value = entities
  referenceCount.value = count

  searchingReferences.value = false
}, { debounce: 500, maxWait: 5000 })

function searchReferences (query) {
  referenceSearch.value = query
}

function renderReferenceOption (option) {
  return h('div',
    { class: 'flex gap-3 items-center' },
    [
      h('div', { }, option.label),
      h('div', { class: 'px-2 rounded bg-blue-50 text-xs text-gray-500' }, option.type)
    ]
  )
}

async function updateValue (newValue) {
  const oldValue = oldValues.value.find(x => x._id === newValue._id) || {}

  const _id = newValue._id
  const language = newValue.language
  let property = null
  let value = null

  switch (props.type) {
    case 'text':
      property = 'string'
      break
    default:
      property = props.type
      break
  }

  value = newValue[property]

  if (typeof value === 'string') value = value.trim() || null
  if (oldValue[property] instanceof Date) value = new Date(value) || null

  if (value === oldValue[property] && language === oldValue.language) return

  isUpdating.value = true

  if (!entityId.value && value !== null && !_id) {
    await addEntity(value, language)
  } else if (entityId.value && value !== null && !_id) {
    await addValue(value, language)
  } else if (entityId.value && value !== null && _id) {
    await editValue(_id, value, language)
  } else if (entityId.value && value === null && _id) {
    await deleteValue(_id)
  }

  syncValues()
  addListValue(_id)

  isUpdating.value = false
}

async function addEntity (value, language) {
  const properties = [{
    type: props.property,
    [props.type]: value,
    language
  }]

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

  const newEntity = await apiUpsertEntity(
    undefined,
    undefined,
    properties
  )

  entityId.value = newEntity._id
}

async function addValue (value, language) {
  const entity = await apiUpsertEntity(
    entityId.value,
    undefined,
    [{
      type: props.property,
      [props.type]: value,
      language
    }]
  )

  const property = entity.properties.find(x => x.type === props.property)
  const newValue = newValues.value.find(x => x._id === undefined)

  newValue._id = property._id
}

async function editValue (_id, value, language) {
  const entity = await apiUpsertEntity(
    entityId.value,
    _id,
    [{
      type: props.property,
      [props.type]: value,
      language
    }]
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
}

async function uploadFile ({ file, onProgress, onFinish, onError }) {
  if (!file?.file) {
    onError()
    return
  }

  const entity = await apiUpsertEntity(
    entityId.value,
    undefined,
    [{
      type: props.property,
      filename: file.file.name,
      filesize: file.file.size,
      filetype: file.file.type || 'application/octet-stream'
    }]
  )

  const property = entity.properties.find(x => x.type === props.property)

  if (!property) {
    onError()
    return
  }

  const newValue = newValues.value.find(x => x._id === undefined)

  newValue._id = property._id
  newValue.filename = property.filename
  newValue.filesize = property.filesize
  newValue.filetype = property.filetype

  addListValue(property._id)
  syncValues()

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
  if (newFiles.value[file.id]) {
    await deleteValue(newFiles.value[file.id])

    delete newFiles.value[file.id]
  } else {
    await deleteValue(file.id)
  }

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
          <n-button
            v-if="isList || !isList && fileList.length === 0"
            :disabled="disabled"
            @click="handleClick"
          >
            {{ t('upload') }}
          </n-button>
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
        clearable
        placeholder=""
        :readonly="disabled"
        @blur="updateValue(value)"
        @clear="deleteValue(value._id)"
        @focus="addListValue(value._id)"
      />

      <n-select
        v-else-if="type === 'string' && set.length > 0"
        v-model:value="value.string"
        clearable
        placeholder=""
        :options="setOptions"
        :readonly="disabled"
        @update:value="updateValue(value)"
        @clear="deleteValue(value._id)"
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
        @clear="deleteValue(value._id)"
        @focus="addListValue(value._id)"
      />

      <n-input-number
        v-else-if="type === 'number'"
        v-model:value="value.number"
        class="w-full"
        clearable
        placeholder=""
        :readonly="disabled"
        :precision="decimals"
        @blur="updateValue(value)"
        @clear="deleteValue(value._id)"
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
        clearable
        placeholder=""
        type="date"
        :readonly="disabled"
        @update:value="updateValue(value)"
        @clear="deleteValue(value._id)"
        @focus="addListValue(value._id)"
      />

      <n-date-picker
        v-else-if="type === 'datetime'"
        v-model:value="value.date"
        class="w-full"
        clearable
        placeholder=""
        type="datetime"
        :readonly="disabled"
        @update:value="updateValue(value)"
        @clear="deleteValue(value._id)"
        @focus="addListValue(value._id)"
      />

      <n-select
        v-else-if="type === 'reference'"
        v-model:value="value.reference"
        clearable
        filterable
        placeholder=""
        remote
        :readonly="disabled"
        :loading="searchingReferences"
        :options="referenceOptions"
        :render-label="renderReferenceOption"
        @clear="deleteValue(value._id)"
        @focus="addListValue(value._id)"
        @search="searchReferences"
        @update:value="updateValue(value)"
      >
        <template
          v-if="referenceCount > referenceLimit"
          #action
        >
          <div class="text-center text-xs">
            {{ t('count', referenceCount - referenceLimit) }}
          </div>
        </template>
        <template
          v-if="searchingReferences"
          #empty
        >
          ...
        </template>
        <template
          v-else-if="rawReferences?.length === 0"
          #empty
        >
          {{ t('noResults') }}
        </template>
        <template
          v-else
          #empty
        >
          {{ t('doSearch') }}
        </template>
      </n-select>

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
    doSearch: Search Entity
    noResults: no entities found
    count: 'no entities found | Found {n} more entity. Refine your search. | Found {n} more entities. Refine your search.'
    upload: Upload
  et:
    doSearch: Otsi objekti
    noResults: objekte ei leitud
    count: 'objekte ei leitud | Leiti veel {n} objekt. Täpsusta otsingut. | Leiti veel {n} objekti. Täpsusta otsingut.'
    upload: Laadi üles
</i18n>
