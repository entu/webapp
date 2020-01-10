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
  },
  updated () {
    this.setTitle(this.name)
  },
  data () {
    return {
      prevRoute: null,
      error: null,
      entity: null,
      definition: null,
      properties: []
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },
  computed: {
    add () {
      return this.$route.name === 'add'
    },
    entityId () {
      return this.$route.params.entity !== '_' ? this.$route.params.entity : null
    },
    parentId () {
      return this.$route.params.parent
    },
    name () {
      if (this.add) {
        return this.definition ? this.getValue(this.definition.label) || this.getValue(this.definition.name) : ''
      } else {
        return this.entity ? this.getValue(this.entity.name) : ''
      }
    },
    right () {
      if (_get(this.entity, '_owner', []).find(x => x.reference === this.userId)) { return 'owner' }
      if (_get(this.entity, '_editor', []).find(x => x.reference === this.userId)) { return 'editor' }
      if (_get(this.entity, '_expander', []).find(x => x.reference === this.userId)) { return 'expander' }
      if (_get(this.entity, '_viewer', []).find(x => x.reference === this.userId)) { return 'viewer' }
    },
    closeTo () {
      if (this.$route.params.entity) {
        return { name: 'entity', params: { entity: this.$route.params.entity }, query: this.$route.query }
      }
      if (this.$route.params.parent) {
        return this.prevRoute
      }
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

      if (this.add) {
        var entity = {}
        var type = this.$route.params.type
      } else {
        var { entity } = await this.axios.get(`/entity/${this.entityId}`)
        var type = _get(entity, '_type.0.reference')
      }

      const { entity: definition } = await this.axios.get(`/entity/${type}`, {
        params: {
          props: [
            'name',
            'label',
            'allowed_child'
          ].join(','),
        }
      })

      this.definition = definition

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
