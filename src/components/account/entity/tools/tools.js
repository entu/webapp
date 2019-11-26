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
    'edit',
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
            '_type',
            'name',
            'optional_parent'
          ].join(',')
        }
      })

      for (var i = 0; i < entities.length; i++) {
        for (var n = 0; n < entities[i].optional_parent.length; n++) {
          const id = _get(entities, [i, 'optional_parent', n, 'reference'])
          if (!id) { continue }

          const { entity } = await this.axios.get(`/entity/${id}`, {
            params: {
              props: [
                'name',
                '_owner',
                '_editor',
                '_expander'
              ].join(',')
            }
          })

          const rights = [..._get(entity, '_owner', []), ..._get(entity, '_editor', []), ..._get(entity, '_expander', [])]
          if (rights.find(x => x.reference === this.userId)) {
            this.addUnderOptionalParent.push({
              type: this.getValue(entities[i]._type),
              typeName: this.getValue(entities[i].name),
              parent: entity._id,
              parentName: this.getValue(entity.name)
            })
          }
        }
      }
    },
    async definition (val) {
      this.addUnderEntity = []

      if (!val.allowed_child) { return }
      if (!['owner', 'editor', 'expander'].includes(this.right)) { return }

      for (var i = 0; i < val.allowed_child.length; i++) {
        const id = _get(val, ['allowed_child', i, 'reference'])
        if (!id) { continue }

        const { entity } = await this.axios.get(`/entity/${id}`, {
          params: {
            props: [
              'name',
              '_type'
            ].join(',')
          }
        })

        this.addUnderEntity.push({
          type: this.getValue(entity._type),
          typeName: this.getValue(entity.name)
        })
      }
    }
  }
}
