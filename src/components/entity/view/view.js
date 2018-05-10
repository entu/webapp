import { get } from 'axios'

import entityList from './list/list.vue'
import entityTools from './tools/tools.vue'

export default {
  name: 'EntityContent',
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
    }
  },
  methods: {
    getEntity () {
      if (!this.id) {
        this.entity = null
        return
      }
      get(`https://api.entu.app/entity/${this.id}`, { headers: this.authHeader })
        .then(response => {
          this.entity = response.data
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
