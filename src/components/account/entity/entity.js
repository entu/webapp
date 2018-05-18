import _get from 'lodash/get'
import _groupBy from 'lodash/groupBy'

import entityList from './list/list.vue'
import entityTools from './tools/tools.vue'

export default {
  name: 'Entity',
  components: {
    'entity-list': entityList,
    'entity-tools': entityTools
  },
  created () {
    this.getEntity()
    this.getChilds()
  },
  data () {
    return {
      entity: null,
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

      return _get(this, 'entity._thumbnail') || `https://secure.gravatar.com/avatar/${this._id}?d=identicon&s=150`
    },
    name () {
      if (!this.entity) { return '' }

      const name = this.getValue(this.entity.title)
      window.document.title = name ? `${name} · Entu` : 'Entu'

      return name
    },
    entityView () {
      const hidden = [
        // '_id',
        // '_search',
        'title'
      ]

      let result = {}
      for (let property in this.entity) {
        if (!this.entity.hasOwnProperty(property)) { continue }
        if (property.startsWith('_') && property !== '_parent') { continue }
        if (hidden.indexOf(property) !== -1) { continue }

        if (Array.isArray(this.entity[property])) {
          result[property] = this.entity[property].map(this.parseValue)
        } else {
          result[property] = [this.entity[property]]
        }
      }

      return result
    }
  },
  methods: {
    getEntity () {
      if (!this._id) {
        this.entity = null
        return
      }

      // this.entity = null
      // this.image = null

      this.axios.get(`/entity/${this._id}`).then((response) => {
        this.entity = response.data
      })
    },
    getChilds () {
      if (!this._id) {
        this.entity = null
        return
      }

      this.childs = null
      this.childsCount = 0

      const query = {
        '_parent.reference': this._id,
        props: '_thumbnail,_type.string,title.string',
        sort: 'title.string',
        limit: 1000
      }

      this.axios.get(`/entity`, { params: query }).then((response) => {
        if (!response.data || !response.data.entities) { return }

        let childs = []
        response.data.entities.forEach((entity) => {
          let e = {
            _id: entity._id,
            _thumbnail: entity._thumbnail || `https://secure.gravatar.com/avatar/${entity._id}?d=identicon&s=150`,
            _type: this.getValue(entity._type),
            title: this.getValue(entity.title),
            to: { name: 'view', params: { entity: entity._id }, query: this.$route.query }
          }
          childs.push(e)
        })

        this.childsCount = childs.length

        if (childs.length > 0) {
          this.childs = _groupBy(childs, '_type')
        }
      })
    },
    parseValue (v) {
      if (v.string) {
        return { string: v.string }
      }
      if (v.date) {
        return { string: (new Date(v.date)).toLocaleString(this.locale) }
      }
      if (v.decimal) {
        return { string: v.decimal.toLocaleString(this.locale, { minimumFractionDigits: 2 }) }
      }
      if (v.reference) {
        return { string: v.reference, to: { name: 'view', params: { entity: v.reference }, query: this.$route.query } }
      }
      if (v.filename) {
        return { string: v.filename, file: `/${this.$route.params.account}/file/${v._id}` }
      }
      if (v.boolean) {
        return { string: v.boolean ? this.$t('true') : this.$t('false') }
      }

      delete v._id

      return v
    }
  }
}
