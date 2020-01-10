'use strict'

import _get from 'lodash/get'
import _groupBy from 'lodash/groupBy'
import _isNumber from 'lodash/isNumber'

import entityTools from './tools/tools.vue'
import entityProperty from './property/property.vue'

export default {
  components: {
    'entity-tools': entityTools,
    'entity-property': entityProperty
  },
  created () {
    this.getEntity()
    this.getChilds()
  },
  updated () {
    this.setTitle(this.name)
  },
  data () {
    return {
      error: null,
      entity: null,
      definition: null,
      properties: [],
      childs: null,
      childsCount: 0
    }
  },
  watch: {
    _id () {
      this.getEntity()
      this.getChilds()
    }
  },
  computed: {
    _id () {
      return this.$route.params.entity !== '_' ? this.$route.params.entity : null
    },
    _thumbnail () {
      if (!this.entity) { return '' }

      return _get(this, 'entity._thumbnail')
    },
    name () {
      if (!this.entity) { return '' }

      return this.getValue(this.entity.name)
    },
    _parent () {
      if (this.entity && this.entity._parent) {
        return this.entity._parent.map(p => {
          return { _id: p.reference, string: p.string, to: { name: 'entity', params: { entity: p.reference }, query: this.$route.query } }
        })
      }
    },
    right () {
      if (_get(this.entity, '_owner', []).find(x => x.reference === this.userId)) { return 'owner' }
      if (_get(this.entity, '_editor', []).find(x => x.reference === this.userId)) { return 'editor' }
      if (_get(this.entity, '_expander', []).find(x => x.reference === this.userId)) { return 'expander' }
      if (_get(this.entity, '_viewer', []).find(x => x.reference === this.userId)) { return 'viewer' }
    },
    viewClass () {
      if (this.hasQuery && this.showMenu) {
        return [
          'col-sm-8',
          'col-md-6',
          'col-lg-7'
        ]
      } else if (this.hasQuery && !this.showMenu) {
        return [
          'col-sm-8',
          'col-lg-9'
        ]
      } else if (!this.hasQuery) {
        return [
          'col-md-10'
        ]
      }
    }
  },
  methods: {
    async getEntity () {
      this.entity = null
      this.definition = null
      this.properties = null
      this.image = null

      if (!this._id) { return }

      const { entity } = await this.axios.get(`/entity/${this._id}`)

      if (_get(entity, '_type.0.reference')) {
        const { entity: definition } = await this.axios.get(`/entity/${_get(entity, '_type.0.reference')}`, {
          params: {
            props: 'allowed_child'
          }
        })

        this.definition = definition
      }

      let properties = []
      if (this.definition) {
        const { entities } = await this.axios.get('/entity', {
          params: {
            '_type.string': 'property',
            '_parent.reference': this.definition._id,
            props: [
              'name.string',
              'label',
              'ordinal.integer',
              'type.string',
              'public.boolean',
              'readonly.boolean',
              'multilingual.boolean',
              'list.boolean',
              'mandatory.boolean',
              'classifier.reference'
            ].join(',')
          }
        })

        properties = entities.map(x => {
          const p = {
            name: _get(x, 'name.0.string', null),
            label: this.getValue(_get(x, 'label', null)),
            ordinal: _get(x, 'ordinal.0.integer', 0),
            type: _get(x, 'type.0.string', false),
            public: _get(x, 'public.0.boolean', false),
            readonly: _get(x, 'readonly.0.boolean', false),
            multilingual: _get(x, 'multilingual.0.boolean', false),
            list: _get(x, 'list.0.boolean', false),
            mandatory: _get(x, 'mandatory.0.boolean', false),
            classifier: _get(x, 'classifier', []).map(x => x.reference),
            values: []
          }

          if (_get(x, 'name.0.string') && _get(entity, _get(x, 'name.0.string'), []).length > 0) {
            p.values = _get(entity, _get(x, 'name.0.string', null), []).map(x => {
              return { ...x, type: p.type }
            })
          }

          return p
        })
      }

      for (var name in entity) {
        if (!entity.hasOwnProperty(name)) { continue }

        if (!properties.find(x => x.name === name) && Array.isArray(entity[name])) {
          const newProperty = {
            name: name,
            values: []
          }

          entity[name].forEach(v => {
            newProperty.values.push({ ...v, type: this.getType(v) })
          })

          newProperty.type = newProperty.values[0].type

          properties.push(newProperty)
        }
      }

      properties.sort((a, b) => {
        if (_isNumber(a.ordinal) && _isNumber(b.ordinal) && a.ordinal < b.ordinal) { return -1 }
        if (_isNumber(a.ordinal) && _isNumber(b.ordinal) && a.ordinal > b.ordinal) { return 1 }

        if (_isNumber(a.ordinal) && !_isNumber(b.ordinal)) { return -1 }
        if (!_isNumber(a.ordinal) && _isNumber(b.ordinal)) { return 1 }

        if (!a.name.startsWith('_') && b.name.startsWith('_')) { return -1 }
        if (a.name.startsWith('_') && !b.name.startsWith('_')) { return 1 }

        if (!a.name || a.name < b.name) { return -1 }
        if (!b.name || a.name > b.name) { return 1 }

        return 0
      })

      this.entity = entity
      this.properties = properties

      if (!['owner', 'editor'].includes(this.right)) {
        this.toggleEdit(false)
      }
    },
    async getChilds () {
      this.childs = null

      if (!this._id) { return }

      const query = {
        '_parent.reference': this._id,
        props: '_thumbnail,_type.string,name',
        sort: 'name.string',
        limit: 1000
      }

      const childsResponse = await this.axios.get(`/entity`, { params: query })

      let childs = []
      childsResponse.entities.forEach(entity => {
        childs.push({
          _id: entity._id,
          _thumbnail: entity._thumbnail,
          _type: this.getValue(entity._type),
          name: this.getValue(entity.name),
          to: { name: 'entity', params: { entity: entity._id }, query: this.$route.query }
        })
      })

      this.childsCount = childs.length

      if (childs.length > 0) {
        this.childs = _groupBy(childs, '_type')
      }
    },
    getType (value) {
      if (value.hasOwnProperty('date')) {
        return 'date'
      }
      if (value.hasOwnProperty('datetime') && value.hasOwnProperty('reference')) {
        return 'atby'
      }
      if (value.hasOwnProperty('datetime')) {
        return 'datetime'
      }
      if (value.hasOwnProperty('integer')) {
        return 'integer'
      }
      if (value.hasOwnProperty('decimal')) {
        return 'decimal'
      }
      if (value.hasOwnProperty('reference')) {
        return 'reference'
      }
      if (value.hasOwnProperty('filename')) {
        return 'file'
      }
      if (value.hasOwnProperty('boolean')) {
        return 'boolean'
      }
      if (value.hasOwnProperty('string')) {
        return 'string'
      }
    }
  }
}
