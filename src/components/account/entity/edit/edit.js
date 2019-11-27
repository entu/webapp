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
  watch: {
    _id () {
      this.getEntity()
    }
  },
  computed: {
    _id () {
      return this.$route.params.entity !== '_' ? this.$route.params.entity : null
    },
    name () {
      if (!this.entity) { return '' }

      return this.getValue(this.entity.name)
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
      if (!this._id) {
        this.entity = null
        return
      }

      // if (!['owner', 'editor'].includes(this.right)) {
      //   this.toggleEdit(false)
      // }

      this.entity = null
      this.image = null

      const { entity } = await this.axios.get(`/entity/${this._id}`)

      const definitionResponse = await this.axios.get('/entity', {
        params: {
          '_type.string': 'entity',
          'key.string': _get(entity, '_type.0.string'),
          props: [
            '_id',
            'allowed_child'
          ].join(','),
          limit: 1
        }
      })
      const definition = definitionResponse.entities[0]

      let properties = []
      if (definition) {
        const { entities } = await this.axios.get('/entity', {
          params: {
            '_type.string': 'property',
            '_parent.reference': definition._id,
            props: [
              'key.string',
              'name.string',
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
            key: _get(x, 'key.0.string', null),
            name: _get(x, 'name.0.string', null),
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

          if (_get(x, 'key.0.string') && _get(entity, _get(x, 'key.0.string'), []).length > 0) {
            p.values = _get(entity, _get(x, 'key.0.string', null), []).map(x => {
              return { ...x, type: p.type }
            })
          }

          return p
        })
      }

      for (var key in entity) {
        if (!entity.hasOwnProperty(key)) { continue }

        if (!properties.find(x => x.key === key) && Array.isArray(entity[key])) {
          const newProperty = {
            key: key,
            values: []
          }

          entity[key].forEach(v => {
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

        if (!a.key.startsWith('_') && b.key.startsWith('_')) { return -1 }
        if (a.key.startsWith('_') && !b.key.startsWith('_')) { return 1 }

        if (!a.key || a.key < b.key) { return -1 }
        if (!b.key || a.key > b.key) { return 1 }

        return 0
      })

      this.entity = entity
      this.definition = definition
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
