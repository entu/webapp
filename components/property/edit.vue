<script setup>
import { NButton, NDatePicker, NInput, NInputNumber, NSelect, NSwitch, NUpload, NUploadTrigger, NUploadFileList } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: undefined },
  entityParentId: { type: String, default: undefined },
  entityTypeId: { type: String, default: undefined },
  decimals: { type: Number, default: 0 },
  isMultilingual: { type: Boolean, default: false },
  property: { type: String, default: undefined },
  referenceQuery: { type: String, default: undefined },
  set: { type: Array, default: () => [] },
  type: { type: String, default: undefined },
  values: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:entity', 'updating:entity', 'add:entity'])

const { t } = useI18n()
const route = useRoute()
const { accountId } = useAccount()

const referenceSearch = ref('')
const referenceLimit = ref(100)
const referenceCount = ref(null)
const rawReferences = ref(null)
const searchingReferences = ref(false)
const newFiles = ref({})

const { cloned: oldValues } = useCloned(props.values)
const { cloned: newValues } = useCloned(props.values)

const languageOptions = [
  { value: 'en', label: 'EN' },
  { value: 'et', label: 'ET' }
]

const setOptions = computed(() => props.set.map(x => ({ value: x, label: x })).sort())

const referenceOptions = computed(() => {
  if (rawReferences.value) {
    return rawReferences.value?.map(x => ({ value: x._id, label: getValue(x.name) || x._id, type: getValue(x._type) })) || []
  } else {
    return props.values.filter(x => !!x._id).map(x => ({ value: x.reference, label: x.string })) || []
  }
})

const fileList = computed(() => props.type === 'file'
  ? props.values.filter(x => !!x._id).map(x => ({
    id: x._id,
    name: x.filename,
    url: `/${accountId.value}/file/${x._id}`,
    status: 'finished'
  }))
  : []
)

watch(newValues, (values) => {
  values = values.map((x) => {
    if (x.date) x.date = new Date(x.date).getTime()
    if (x.datetime) x.datetime = new Date(x.datetime).getTime()

    return x
  })
}, { deep: true, immediate: true })

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

  emit('updating:entity')

  if (!props.entityId && value !== null && !_id) {
    await addEntity(value, language)
  } else if (props.entityId && value !== null && !_id) {
    await addValue(value, language)
  } else if (props.entityId && value !== null && _id) {
    await editValue(_id, value, language)
  } else if (props.entityId && value === null && _id) {
    await deleteValue(_id)
  }

  emit('update:entity')
}

async function addEntity (value, language) {
  const properties = [{
    type: props.property,
    [props.type]: value,
    language
  }]

  if (props.entityParentId) {
    properties.push({
      type: '_parent',
      reference: props.entityParentId
    })
  }

  if (props.entityTypeId) {
    properties.push({
      type: '_type',
      reference: props.entityTypeId
    })
  }

  const newEntity = await apiUpsertEntity(
    props.entityId,
    undefined,
    properties
  )

  await navigateTo({ path: `/${accountId.value}/${newEntity._id}`, query: route.query, hash: '#edit' }, { replace: true })
}

async function addValue (value, language) {
  await apiUpsertEntity(
    props.entityId,
    undefined,
    [{
      type: props.property,
      [props.type]: value,
      language
    }]
  )
}

async function editValue (_id, value, language) {
  await apiUpsertEntity(
    props.entityId,
    _id,
    [{
      type: props.property,
      [props.type]: value,
      language
    }]
  )
}

async function deleteValue (_id) {
  await apiUpsertEntity(
    props.entityId,
    _id
  )
}

async function uploadFile ({ file, onProgress, onFinish, onError }) {
  if (!file?.file) {
    onError()
    return
  }

  const newFileProperties = await apiUpsertEntity(
    props.entityId,
    undefined,
    [{
      type: props.property,
      filename: file.file.name,
      filesize: file.file.size,
      filetype: file.file.type || 'application/octet-stream'
    }]
  )

  const newProperty = newFileProperties?.properties?.at(0)

  if (!newProperty) {
    onError()
    return
  }

  const sendForm = newProperty.upload

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
      file._id = newProperty._id
      file.url = `/${accountId.value}/file/${newProperty._id}`

      newFiles.value[file.id] = newProperty._id

      onFinish()
    } else {
      onError()
    }
  })

  request.send(file.file)
}

async function deleteFile ({ file }) {
  if (newFiles.value[file.id]) {
    await deleteValue(newFiles.value[file.id])

    delete newFiles.value[file.id]
  } else {
    await deleteValue(file.id)
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
        multiple
        :default-file-list="fileList"
        :show-cancel-button="false"
        :custom-request="uploadFile"
        @remove="deleteFile"
      >
        <n-upload-file-list
          v-if="fileList.length > 0"
          class="w-full mb-2 text-sm"
        />

        <n-upload-trigger #="{ handleClick }" abstract>
          <n-button
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
      />

      <n-select
        v-else-if="type === 'string' && set.length > 0"
        v-model:value="value.string"
        clearable
        placeholder=""
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
          maxRows: 15
        }"
        :readonly="disabled"
        @blur="updateValue(value)"
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
