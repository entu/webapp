import _debounce from 'lodash/debounce'
import _get from 'lodash/get'

export default {
  name: 'EntityList',
  data () {
    return {
      searchString: '',
      loading: false,
      limit: 20,
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
      query.props = 'title.string,photo._id'
      query.sort = 'title.string'
      query.limit = this.limit
      query.skip = this.skip

      this.axios.get('/entity', { params: query })
        .then((response) => {
          if (!response.data || !response.data.entities) { return }

          let imageRequests = []
          response.data.entities.forEach((entity) => {
            let e = {
              _id: entity._id,
              title: this.getValue(entity.title),
              description: this.getValue(entity.description),
              image: null
            }
            this.entities.push(e)

            if (_get(entity, 'photo.0._id')) {
              imageRequests.push(this.getImage(_get(entity, 'photo.0._id'), e))
            } else {
              e.image = `https://secure.gravatar.com/avatar/${entity._id}?d=identicon&s=150`
            }
          })

          this.skip += this.limit
          this.loading = false

          this.axios.all(imageRequests)
            .then(this.axios.spread(function (acct, perms) {
              console.log(acct)
              console.log(perms)
            }))
        }).catch(() => {
          this.loading = false
        })
    },
    getImage (photoId, entity) {
      return this.axios.get(`/property/${photoId}`)
        .then((response) => {
          entity.image = _get(response, 'data.url', `https://secure.gravatar.com/avatar/${entity._id}?d=identicon&s=150`)
        })
    },
    setSearchString () {
      this.searchString = _get(this, '$route.query.q', '')
    },
    doSearch: _debounce(function () {
      let query = Object.assign({}, this.$route.query)

      if (this.searchString) {
        query['q'] = this.searchString
      } else {
        delete query['q']
      }

      this.$router.push({ name: 'view', params: { entity: this.$route.params.entity }, query: query })
    }, 500)
  }
}
