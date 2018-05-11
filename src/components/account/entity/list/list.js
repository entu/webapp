import _debounce from 'lodash/debounce'

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
    queryStr () {
      this.getEntities(true)
      this.setSearchString()
    },
    searchString () {
      this.doSearch()
    }
  },
  computed: {
    isQuery () {
      return Object.keys(this.$route.query).length > 0
    },
    queryStr () {
      return JSON.stringify(this.$route.query)
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
      if (!this.isQuery) { return }
      if (this.loading) { return }
      if (restart) {
        this.skip = 0
        this.entities = []
      }
      if (this.allFetched) { return }

      this.loading = true

      let query = Object.assign({}, this.$route.query)
      query.props = 'title.string,photo_id'
      query.sort = 'title.string'
      query.limit = this.limit
      query.skip = this.skip

      this.axios.get('/entity', { params: query })
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
      let query = Object.assign({}, this.$route.query)

      if (query['title.string.regex']) {
        this.searchString = query['title.string.regex']

        if (this.searchString.startsWith('/') && this.searchString.endsWith('/i')) {
          this.searchString = this.searchString.substr(1, this.searchString.length - 3)
        }
      } else {
        this.searchString = ''
      }
    },
    doSearch: _debounce(function () {
      let query = Object.assign({}, this.$route.query)

      if (this.searchString) {
        query['title.string.regex'] = `/${this.searchString}/i`
      } else {
        delete query['title.string.regex']
      }

      this.$router.push({ name: 'view', params: { entity: this.$route.params.entity }, query: query })
    }, 500)
  }
}
