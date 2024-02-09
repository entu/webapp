export const useEntityTypeStore = defineStore('entityType', () => {
  const entityTypes = ref({})

  async function get (_id) {
    const rawEntityType = await apiGetEntity(_id, [
      'description',
      'label',
      'name'
    ])

    const rawEntityProps = await apiGetEntities({
      '_parent.reference': _id,
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

    entityTypes.value[_id] = {
      type: {
        _id: rawEntityType._id,
        name: getValue(rawEntityType.name),
        label: getValue(rawEntityType.label),
        description: getValue(rawEntityType.description)
      },
      props: rawEntityProps?.entities?.map(p => ({
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
        type: getValue(p.type)
      }))
    }
  }

  return {
    entityTypes,
    get
  }
})
