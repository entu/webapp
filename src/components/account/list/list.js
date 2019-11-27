'use strict'

import _debounce from 'lodash/debounce'
import _get from 'lodash/get'

export default {
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
    this.setTitle()

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
    async getEntities (restart) {
      if (!this.hasQuery) { return }
      if (this.loading) { return }
      if (restart) {
        this.skip = 0
        this.entities = []
      }
      if (this.allFetched) { return }

      this.loading = true

      let query = { ...this.$route.query }
      query.props = '_thumbnail,name'
      query.sort = 'name.string'
      query.limit = this.limit
      query.skip = this.skip

      const { entities } = await this.axios.get('/entity', { params: query })

      if (!entities) { return }

      entities.forEach(entity => {
        this.entities.push({
          _id: entity._id,
          _thumbnail: entity._thumbnail,
          name: this.getValue(entity.name),
          description: this.getValue(entity.description)
        })
      })

      this.skip += this.limit
      this.loading = false
    },
    setSearchString () {
      this.searchString = _get(this, '$route.query.q', '')
    },
    doSearch: _debounce(function () {
      let query = { ...this.$route.query }

      if (this.searchString) {
        query.q = this.searchString
      } else {
        delete query.q
      }

      this.$router.push({ name: 'entity', params: { entity: this.$route.params.entity }, query: query })
    }, 500),
    hideList () {
      if (document.body.clientWidth <= 576) {
        this.toggleList(false)
      }
    }
  }
}
