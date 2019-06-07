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
  updated () {
    this.setTitle(this.name)
  },
  data () {
    return {
      error: null,
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
    isQuery () {
      return Object.keys(this.$route.query).length > 0
    },
    _id () {
      return this.$route.params.entity !== '_' ? this.$route.params.entity : null
    },
    _thumbnail () {
      if (!this.entity) { return '' }

      return _get(this, 'entity._thumbnail') || `https://secure.gravatar.com/avatar/${this._id}?d=identicon&s=150`
    },
    name () {
      if (!this.entity) { return '' }

      return this.getValue(this.entity.name) || this.entity._id
    },
    entityView () {
      let result = {}

      for (let property in this.entity) {
        if (!this.entity.hasOwnProperty(property)) { continue }
        if (property.startsWith('_')) { continue }
        if (property === 'name') { continue }

        if (Array.isArray(this.entity[property])) {
          result[property] = this.entity[property].filter(this.filterByLanguage).map(this.parseValue)
        } else {
          result[property] = [this.entity[property]]
        }
      }

      return result
    },
    _parent () {
      if (this.entity && this.entity._parent) {
        return this.entity._parent.map(p => {
          return { _id: p.reference, string: p.string || p.reference, to: { name: 'view', params: { entity: p.reference }, query: this.$route.query } }
        })
      }
    }
  },
  methods: {
    getEntity () {
      if (!this._id) {
        this.entity = null
        return
      }

      this.entity = null
      this.image = null

      this.axios.get(`/entity/${this._id}`).then(response => {
        this.error = null
        this.entity = response.data
      }).catch(err => {
        this.error = err
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
        props: '_thumbnail,_type.string,name',
        sort: 'name.string',
        limit: 1000
      }

      this.axios.get(`/entity`, { params: query }).then(response => {
        if (!response.data || !response.data.entities) { return }

        let childs = []
        response.data.entities.forEach(entity => {
          childs.push({
            _id: entity._id,
            _thumbnail: entity._thumbnail || `https://secure.gravatar.com/avatar/${entity._id}?d=identicon&s=150`,
            _type: this.getValue(entity._type),
            name: this.getValue(entity.name),
            to: { name: 'view', params: { entity: entity._id }, query: this.$route.query }
          })
        })

        this.childsCount = childs.length

        if (childs.length > 0) {
          this.childs = _groupBy(childs, '_type')
        }
      })
    },
    filterByLanguage (v) {
      return !v.language || v.language === this.locale
    },
    parseValue (v) {
      if (v.hasOwnProperty('date')) {
        return { string: (new Date(v.date.substr(0, 10))).toLocaleDateString(this.locale) }
      }
      if (v.hasOwnProperty('datetime')) {
        return { string: (new Date(v.datetime)).toLocaleString(this.locale) }
      }
      if (v.hasOwnProperty('integer')) {
        return { string: v.integer.toLocaleString(this.locale, { minimumFractionDigits: 0 }) }
      }
      if (v.hasOwnProperty('decimal')) {
        return { string: v.decimal.toLocaleString(this.locale, { minimumFractionDigits: 2 }) }
      }
      if (v.hasOwnProperty('reference')) {
        return { string: v.string || v.reference, to: { name: 'view', params: { entity: v.reference }, query: this.$route.query } }
      }
      if (v.hasOwnProperty('filename')) {
        return { string: v.filename, file: `/${account}/file/${v._id}`, size: this.getReadableFileSize(v.size) }
      }
      if (v.hasOwnProperty('boolean')) {
        return { string: v.boolean ? this.$t('true') : this.$t('false') }
      }
      if (v.hasOwnProperty('string')) {
        return { string: v.string }
      }

      delete v._id

      return v
    }
  }
}
