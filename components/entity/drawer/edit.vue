<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const props = defineProps({
  entityId: { type: String, default: null },
  entityParentId: { type: String, default: null },
  entityTypeId: { type: String, default: null }
})

const emit = defineEmits(['update:title', 'update:entity', 'updating:entity', 'add:entity'])

const { locale, t } = useI18n()

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
        set: p.set,
        referenceQuery: getValue(p.reference_query),
        type: getValue(p.type),
        values: []
      }))
      : []
  }

  for (const property in rawEntity.value) {
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
    if (property.readonly) return
    if (property.formula) return
    if (property.hidden) return

    const group = property.group || ''
    const ordinal = property.ordinal || 0

    if (!propsObject[group]) {
      propsObject[group] = {
        name: group,
        children: [],
        ordinal: 0
      }
    }

    if (property.list || property.values?.length === 0) {
      const empty = property.multilingual ? { language: locale.value } : {}

      if (property.default) {
        empty.string = property.default
      }

      property.values.push(empty)
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

watch([() => props.entityId, () => props.entityTypeId], loadEntity, { immediate: true })

async function loadEntity () {
  isLoading.value = true

  if (props.entityId) {
    rawEntity.value = await apiGetEntity(props.entityId)
  }

  const entityTypeId = props.entityTypeId || getValue(rawEntity.value?._type, 'reference')

  if (!entityTypeId) return

  rawEntityType.value = await apiGetEntity(entityTypeId, [
    'description',
    'label_plural',
    'label',
    'name'
  ])

  const { entities } = await apiGetEntities({
    '_parent.reference': entityTypeId,
    props: [
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
      'set',
      'reference_query',
      'type'
    ]
  })

  entityProps.value = entities

  isLoading.value = false
}

onMounted(() => {
  if (props.entityParentId && props.entityTypeId) emit('update:title', t('titleChild'))
  if (!props.entityParentId && props.entityTypeId) emit('update:title', t('titleAdd'))
  if (!props.entityParentId && props.entityId) emit('update:title', t('titleEdit'))
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

    <property-list
      edit
      :entity-id="entity._id"
      :entity-parent-id="entityParentId"
      :entity-type-id="entityTypeId"
      :properties="pg.children"
      @updating:entity="emit('updating:entity', $event)"
      @entity:update="emit('entity:update', $event)"
      @add:entity="emit('add:entity', $event)"
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
