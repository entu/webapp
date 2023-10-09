<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const props = defineProps({
  entityId: { type: String, default: null },
  parentId: { type: String, default: null },
  typeId: { type: String, default: null }
})

const emit = defineEmits(['update:title'])

const { t } = useI18n()

const rawEntity = ref()
const rawEntityType = ref()
const entityProps = ref([])
const isLoading = ref(false)

const entity = computed(() => {
  const result = {
    _id: rawEntity.value?._id,
    name: getValue(rawEntity.value?.name),
    type: rawEntityType.value
      ? {
          _id: rawEntityType.value._id,
          name: getValue(rawEntityType.value.name),
          label: getValue(rawEntityType.value.label),
          labelPlural: getValue(rawEntityType.value.label_plural),
          description: getValue(rawEntityType.value.description)
        }
      : {},
    props: entityProps.value
      ? entityProps.value.map(p => ({
        classifier: p.classifier,
        decimals: getValue(p.decimals, 'number'),
        default: getValue(p.default),
        description: getValue(p.description),
        formula: getValue(p.formula),
        group: getValue(p.group),
        hidden: getValue(p.hidden, 'boolean'),
        label: getValue(p.label),
        labelPlural: getValue(p.label_plural),
        list: getValue(p.list, 'boolean'),
        mandatory: getValue(p.mandatory, 'boolean'),
        markdown: getValue(p.markdown, 'boolean'),
        multilingual: getValue(p.multilingual, 'boolean'),
        name: getValue(p.name),
        ordinal: getValue(p.ordinal, 'number'),
        public: getValue(p.public, 'boolean'),
        readonly: getValue(p.readonly, 'boolean'),
        search: getValue(p.search, 'boolean'),
        type: getValue(p.type)
      }))
      : []
  }

  for (const property in rawEntity.value) {
    if (['_id', '_thumbnail'].includes(property)) continue

    const existingProperty = result.props.find(x => x.name === property)

    if (existingProperty) {
      existingProperty.values = rawEntity.value[property]
    } else {
      result.props.push({ name: property, values: rawEntity.value[property] })
    }
  }

  return result
})

const properties = computed(() => {
  if (!entity.value || !entity?.value?.props) return []

  const propsObject = {}

  entity.value.props.forEach((property) => {
    if (property.name.startsWith('_')) return

    const group = property.group || ''
    const ordinal = property.ordinal || 0

    if (!propsObject[group]) {
      propsObject[group] = {
        name: group,
        children: [],
        ordinal: 0
      }
    }

    propsObject[group].ordinal += ordinal
    propsObject[group].children.push(property)
  })

  const result = Object.values(propsObject)

  result.forEach((m) => {
    m.ordinal = m.name ? m.ordinal / m.children.length : 0
    m.children.sort(propsSorter)
  })

  result.sort(propsSorter)

  return result
})

watch([() => props.entityId, () => props.typeId], loadEntity, { immediate: true })

async function loadEntity () {
  isLoading.value = true

  if (props.entityId) {
    rawEntity.value = await apiGetEntity(props.entityId)
  }

  const typeId = props.typeId || getValue(rawEntity.value?._type, 'reference')

  if (!typeId) return

  rawEntityType.value = await apiGetEntity(typeId, [
    'description',
    'label_plural',
    'label',
    'name'
  ])

  const { entities } = await apiGetEntities({
    '_parent.reference': typeId,
    props: [
      'classifier',
      'decimals',
      'default',
      'description',
      'formula',
      'group',
      'hidden',
      'label_plural',
      'label',
      'list',
      'mandatory',
      'markdown',
      'multilingual',
      'name',
      'ordinal',
      'public',
      'readonly',
      'search',
      'type'
    ]
  })

  entityProps.value = entities

  isLoading.value = false
}

onMounted(() => {
  if (props.parentId && props.typeId) emit('update:title', t('titleChild'))
  if (!props.parentId && props.typeId) emit('update:title', t('titleAdd'))
  if (!props.parentId && props.entityId) emit('update:title', t('titleEdit'))
})
</script>

<template>
  <template
    v-for="pg in properties"
    :key="pg.name"
  >
    <h2 v-if="pg.name">
      {{ pg.name }}
    </h2>

    <entity-property-list
      class="pl-5"
      edit
      :properties="pg.children"
    />
  </template>
</template>

<i18n lang="yaml">
  en:
    titleAdd: Add
    titleChild: Add Child
    titleEdit: Edit
  et:
    titleAdd: Lisa
    titleChild: Lisa alamobjekt
    titleEdit: Muuda
</i18n>
