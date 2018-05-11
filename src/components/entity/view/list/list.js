const _debounce = require('lodash/debounce')

export default {
  name: 'EntityList',
  data () {
    return {
      searchString: '',
      loading: false,
      limit: 50,
      skip: 0,
      entities: []
    }
  },
  mounted () {
    this.getEntities(true)
    this.setSearchString()

    const el = document.getElementById('list')
    if (el) {
      el.addEventListener('scroll', () => {
        const toBottom = el.scrollHeight - el.offsetHeight - el.scrollTop

        if (toBottom < 200) {
          this.getEntities()
        }
      })
    }
  },
  watch: {
    query () {
      this.getEntities(true)
      this.setSearchString()
    },
    searchString () {
      this.doSearch()
    }
  },
  computed: {
    query () {
      return this.$route.params.query
    },
    queryObj () {
      if (!this.query) { return {} }

      const query = this.query.split('&')

      let params = {}
      for (let parameter of query) {
        let p = parameter.split('=')
        params[p[0]] = p[1]
      }

      return params
    },
    count () {
      return this.entities.length
    },
    allFetched () {
      return this.entities.length < this.skip
    }
  },
  methods: {
    getEntities (restart) {
      if (this.loading) { return }
      if (restart) {
        this.skip = 0
        this.entities = []
      }
      if (this.allFetched) { return }

      this.loading = true

      let params = this.queryObj
      params.props = 'title.string,photo_id'
      params.sort = 'title.string'
      params.limit = this.limit
      params.skip = this.skip

      this.axios.get('/entity', { params: params })
        .then((response) => {
          if (!response.data || !response.data.entities) { return }

          response.data.entities.forEach((entity) => {
            this.entities.push({
              _id: entity._id,
              title: this.getValue(entity.title),
              description: this.getValue(entity.description),
              img: `https://secure.gravatar.com/avatar/${entity._id}?d=identicon&s=150`
            })
          })

          this.skip += this.limit
          this.loading = false
        }).catch(() => {
          this.loading = false
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
    doSearch: _debounce(function () {
      let query = []
      let params = this.queryObj

      console.log(this.searchString)

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
    }, 500)
  }
}
