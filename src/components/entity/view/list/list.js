export default {
  name: 'EntityList',
  data () {
    return {
      entities: []
    }
  },
  created () {
    this.getEntities()
  },
  watch: {
    query () {
      this.getEntities()
    }
  },
  computed: {
    query () {
      return this.$route.params.query
    }
  },
  methods: {
    getEntities (q) {
      const query = new URLSearchParams(this.query)

      let params = {}
      for (let p of query) {
        params[p[0]] = p[1]
      }
      params.props = 'title.string,photo_id'
      params.sort = 'title.string'

      this.entities = []
      this.axios.get('/entity', { params: params })
        .then(response => {
          if (!response.data || !response.data.entities) { return }

          response.data.entities.forEach((entity) => {
            this.entities.push({
              _id: entity._id,
              title: this.getValue(entity.title),
              description: this.getValue(entity.description),
              img: `https://secure.gravatar.com/avatar/${entity._id}?d=identicon&s=150`
            })
          })
        }).catch(err => {
          console.error(err.response.data.message || err.response.data || err.response || err)
        })
    }
  },
  getPhoto (id) {

  }
}
