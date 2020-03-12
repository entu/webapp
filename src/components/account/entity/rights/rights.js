'use strict'

import _get from 'lodash/get'

import entityTools from './tools/tools.vue'

export default {
  components: {
    'entity-tools': entityTools
  },
  created () {
    this.getEntity()
  },
  data () {
    return {
      entity: null,
      public: false,
      propagate: true,
      rights: []
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },
  computed: {
    _id () {
      return this.$route.params.entity !== '_' ? this.$route.params.entity : null
    },
    name () {
      return this.entity ? this.getValue(this.entity.name) : ''
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
      const { entity } = await this.axios.get(`/entity/${this._id}`, {
        params: {
          props: [
            'name',
            '_public.boolean',
            '_propagate_rights.boolean',
            '_viewer',
            '_editor',
            '_expander',
            '_owner'
          ].join(','),
        }
      })

      this.entity = entity
      this.public = _get(entity, '_public.0.boolean')
      this.propagate = _get(entity, '_propagate_rights.0.boolean')

      if (!_get(entity, '_owner', []).find(x => x.reference === this.userId)) {
        this.$router.push({ name: 'entity', params: { entity: this._id }, query: this.$route.query })
      }

      const viewers = _get(entity, '_viewer', []).map(x => {
        return { ...x, right: 'viewer' }
      })
      const editors = _get(entity, '_editor', []).map(x => {
        return { ...x, right: 'editor' }
      })
      const expanders = _get(entity, '_expander', []).map(x => {
        return { ...x, right: 'expander' }
      })
      const owners = _get(entity, '_owner', []).map(x => {
        return { ...x, right: 'owner' }
      })

      this.rights = [ ...viewers, ...editors, ...expanders, ...owners ]

      this.rights.sort((a, b) => {
        if (!a.string || a.string < b.string) { return -1 }
        if (!b.string || a.string > b.string) { return 1 }

        return 0
      })

    }
  }
}
