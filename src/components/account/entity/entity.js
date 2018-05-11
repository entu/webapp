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
      const name = this.getValue(this.entity.title)
      window.document.title = name ? `${name} · Entu` : 'Entu'
      return name
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
    }
  }
}
