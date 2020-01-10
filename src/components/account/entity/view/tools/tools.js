'use strict'

import _get from 'lodash/get'

export default {
  name: 'EntityTools',
  data () {
    return {
      addUnderEntity: [],
      addUnderOptionalParent: [],
      addMenuDropdown: false
    }
  },
  props: [
    'entity',
    'definition',
    'name',
    'right'
  ],
  watch: {
    async activeMenu (val) {
      this.addUnderOptionalParent = []

      if (!val) { return }

      const { entities } = await this.axios.get(`/entity`, {
        params: {
          '_type.string': 'entity',
          'add_from_menu.reference': val,
          'optional_parent._id.exists': 'true',
          props: [
            'name',
            'label',
            'optional_parent'
          ].join(',')
        }
      })

      for (var i = 0; i < entities.length; i++) {
        for (var n = 0; n < entities[i].optional_parent.length; n++) {
          const id = _get(entities, [i, 'optional_parent', n, 'reference'])
          if (!id) { continue }

          const { entity: parent } = await this.axios.get(`/entity/${id}`, {
            params: {
              props: [
                'name',
                '_owner',
                '_editor',
                '_expander'
              ].join(',')
            }
          })

          const rights = [..._get(parent, '_owner', []), ..._get(parent, '_editor', []), ..._get(parent, '_expander', [])]
          if (rights.find(x => x.reference === this.userId)) {
            this.addUnderOptionalParent.push({
              type: entities[i]._id,
              typeName: this.getValue(entities[i].label) || this.getValue(entities[i].name),
              parent: parent._id,
              parentName: this.getValue(parent.name)
            })
          }
        }
      }
    },
    async definition () {
      this.setAddUnderEntity()
    },
    async right () {
      this.setAddUnderEntity()
    }
  },
  computed: {
    _id () {
      return _get(this, 'entity._id')
    },
    addMenu () {
      const items = [...this.addUnderEntity, ...this.addUnderOptionalParent]

      const to = items.map(x => {
        return {
          key: (x.parent || _get(this, 'entity._id')) + x.type,
          name: x.typeName,
          to: { name: 'add', params: { parent: x.parent || _get(this, 'entity._id'), type: x.type }, query: this.$route.query }
        }
      })

      to.sort((a, b) => {
        if (a.name < b.name) { return -1 }
        if (a.name > b.name) { return 1 }
        return 0
      })

      return to
    }
  },
  methods: {
    async setAddUnderEntity () {
      this.addUnderEntity = []

      if (!this.right) { return }
      if (!this.definition) { return }
      if (!this.definition.allowed_child) { return }
      if (!['owner', 'editor', 'expander'].includes(this.right)) { return }

      for (var i = 0; i < this.definition.allowed_child.length; i++) {
        const id = _get(this.definition, ['allowed_child', i, 'reference'])
        if (!id) { continue }

        const { entity } = await this.axios.get(`/entity/${id}`, {
          params: {
            props: [
              'name',
              'label'
            ].join(',')
          }
        })

        this.addUnderEntity.push({
          type: entity._id,
          typeName: this.getValue(entity.label) || this.getValue(entity.name)
        })
      }
    }
  }
}
