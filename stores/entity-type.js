export const useEntityTypeStore = defineStore('entityType', () => {
  const entityTypes = ref({})

  async function get (_id) {
    const rawPlugins = await apiGetEntities({
      '_type.string': 'plugin',
      props: [
        'name',
        'type',
        'url',
        'new_window'
      ]
    })
    const plugins = rawPlugins?.entities?.map(p => ({
      _id: p._id,
      name: getValue(p.name),
      type: getValue(p.type),
      url: getValue(p.url),
      newWindow: getValue(p.new_window, 'boolean')
    }))

    const rawEntityType = await apiGetEntity(_id, [
      'description',
      'label',
      'name',
      'plugin'
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
        'readonly',
        'reference_query',
        'set',
        'sharing',
        'plugin',
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
      plugins: rawEntityType.plugin?.map(x => plugins.find(p => p._id === x.reference)),
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
        plugins: p.plugin?.map(x => plugins.find(p => p._id === x.reference)),
        readonly: getValue(p.readonly, 'boolean'),
        referenceQuery: getValue(p.reference_query),
        set: p.set,
        sharing: getValue(p.sharing),
        type: getValue(p.type)
      }))
    }
  }

  return {
    entityTypes,
    get
  }
})
