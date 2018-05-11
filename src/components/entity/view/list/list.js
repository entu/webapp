export default {
  name: 'EntityList',
  data () {
    return {
      searchString: '',
      entities: []
    }
  },
  created () {
    this.getEntities()
    this.setSearchString()
  },
  watch: {
    query () {
      this.getEntities()
      this.setSearchString()
    }
  },
  computed: {
    query () {
      return this.$route.params.query
    },
    queryObj () {
      if (!this.query) { return }

      const query = this.query.split('&')

      let params = {}
      for (let parameter of query) {
        let p = parameter.split('=')
        params[p[0]] = p[1]
      }

      return params
    }
  },
  methods: {
    getEntities () {
      let params = this.queryObj

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
    },
    setSearchString () {
      if (this.queryObj['title.string.regex']) {
        this.searchString = this.queryObj['title.string.regex']

        if (this.searchString.startsWith('/') && this.searchString.endsWith('/i')) {
          this.searchString = this.searchString.substr(1, this.searchString.length - 3)
        }
      } else {
        this.searchString = ''
      }
    },
    doSearch () {
      let query = []
      let params = this.queryObj

      if (this.searchString) {
        params['title.string.regex'] = `/${this.searchString}/i`
      } else {
        delete params['title.string.regex']
      }

      for (var variable in params) {
        if (variable === 'props') { continue }
        query.push(`${variable}=${params[variable]}`)
      }

      this.$router.push({ name: 'view', params: { entity: this.$route.params.entity, query: query.join('&') } })
    }
  }
}
