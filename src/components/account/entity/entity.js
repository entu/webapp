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
  },
  data () {
    return {
      entity: null
    }
  },
  watch: {
    id () {
      this.getEntity()
    }
  },
  computed: {
    id () {
      return this.$route.params.entity !== '_' ? this.$route.params.entity : null
    },
    name () {
      if (!this.entity) { return '' }

      const name = this.getValue(this.entity.title)
      window.document.title = name ? `${name} · Entu` : 'Entu'

      return name
    },
    entityView () {
      const hidden = [
        '_id',
        'title'
      ]

      let result = {}
      for (var property in this.entity) {
        if (!this.entity.hasOwnProperty(property)) { continue }
        // if (property.startsWith('_')) { continue }
        if (hidden.indexOf(property) !== -1) { continue }

        result[property] = this.entity[property].map(this.parseValue)
      }

      return result
    }
  },
  methods: {
    getEntity () {
      if (!this.id) {
        this.entity = null
        return
      }
      this.axios.get(`/entity/${this.id}`).then((response) => {
        this.entity = response.data
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
