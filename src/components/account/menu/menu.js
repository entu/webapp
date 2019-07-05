export default {
  data () {
    return {
      user: {
        name: null,
        photo: null
      },
      menu: []
    }
  },
  created () {
    this.getUser()
    this.getMenu()
  },
  computed: {
    entity () {
      return this.$route.params.entity || '_'
    },
    authTo () {
      if (this.accounts.length === 1) {
        return { name: 'auth', params: { id: 'exit' } }
      } else {
        return { name: 'auth' }
      }
    }
  },
  methods: {
    getUser () {
      if (!this.userId) { return }

      const options = {
        params: {
          props: [
            'forename.string',
            'forename.language',
            'surname.string',
            'surname.language',
            'photo._id'
          ].join(',')
        }
      }

      this.axios.get(`/entity/${this.userId}`, options).then(response => {
        this.user.name = [this.getValue(response.data.forename), this.getValue(response.data.forename)].join(' ')

        if (!response.data.photo) { return }

        this.axios.get(`/property/${response.data.photo[0]._id}`).then(response => {
          this.user.photo = response.data.url
          delete this.user.photoId
        })
      })
    },
    getMenu () {
      const sorter = (a, b) => {
        if (!a.name || a.name < b.name) { return -1 }
        if (!b.name || a.name > b.name) { return 1 }
        return 0
      }

      const options = {
        params: {
          '_type.string': 'menu',
          props: [
            'group.string',
            'group.language',
            'name.string',
            'name.language',
            'query.string'
          ].join(',')
        }
      }

      this.axios.get('/entity', options).then(response => {
        if (!response.data || !response.data.entities) { return }

        let menu = {}

        response.data.entities.forEach(entity => {
          let group = this.getValue(entity.group)

          if (!menu[group]) {
            menu[group] = {
              name: this.getValue(entity.group),
              links: [],
              active: false
            }
          }

          menu[group].links.push({
            _id: entity._id,
            name: this.getValue(entity.name),
            query: this.queryObj(this.getValue(entity.query))
          })
        })

        this.menu = Object.values(menu)

        this.menu.forEach(m => {
          m.links.sort(sorter)
        })
        this.menu.sort(sorter)

        this.menu[0].active = true
      })
    },
    queryObj (q) {
      if (!q) { return {} }

      const query = q.split('&')

      let params = {}
      for (let parameter of query) {
        let p = parameter.split('=')
        params[p[0]] = p[1]
      }

      return params
    },
    hideMenu () {
      if (document.body.clientWidth <= 768) {
        this.toggleMenu()
      }
    }
  }
}
