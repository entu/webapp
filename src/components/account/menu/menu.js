'use strict'

export default {
  data () {
    return {
      user: {
        name: null,
        photo: null
      },
      menu: [],
      loading: false
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
    async getUser () {
      if (!this.userId) { return }

      const userResponse = await this.axios.get(`/entity/${this.userId}`, {
        params: {
          props: [
            'forename.string',
            'forename.language',
            'surname.string',
            'surname.language',
            '_thumbnail'
          ].join(',')
        }
      })

      this.user.name = [this.getValue(userResponse.entity.forename), this.getValue(userResponse.entity.forename)].join(' ')
      this.user.photo = userResponse.entity._thumbnail
    },
    async getMenu () {
      this.loading = true

      const sorter = (a, b) => {
        if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) { return -1 }
        if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) { return 1 }

        if (!a.ordinal && b.ordinal) { return -1 }
        if (a.ordinal && !b.ordinal) { return 1 }

        if (!a.name || a.name < b.name) { return -1 }
        if (!b.name || a.name > b.name) { return 1 }

        return 0
      }

      const menuResponse = await this.axios.get('/entity', {
        params: {
          '_type.string': 'menu',
          props: [
            'ordinal.integer',
            'group.string',
            'group.language',
            'name.string',
            'name.language',
            'query.string'
          ].join(',')
        }
      })

      if (!menuResponse || !menuResponse.entities) { return }

      let menu = {}

      menuResponse.entities.forEach(entity => {
        const group = this.getValue(entity.group)
        const ordinal = entity.ordinal ? entity.ordinal[0].integer : 0

        if (!menu[group]) {
          menu[group] = {
            ordinal: 0,
            name: this.getValue(entity.group),
            links: [],
            active: false
          }
        }

        menu[group].ordinal += ordinal
        menu[group].links.push({
          _id: entity._id,
          ordinal: ordinal,
          name: this.getValue(entity.name),
          query: this.queryObj(this.getValue(entity.query)),
          queryStr: this.getValue(entity.query)
        })

        if (this.getValue(entity.query) === this.queryStr()) {
          this.setActiveMenu(entity._id)
        }
      })

      this.menu = Object.values(menu)

      this.menu.forEach(m => {
        m.ordinal = m.ordinal / m.links.length
        m.links.sort(sorter)
      })
      this.menu.sort(sorter)

      if (this.menu[0]) {
        this.menu[0].active = true
      }

      this.loading = false
    },
    queryStr () {
      return window.location.search.substr(1)
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
    menuSelect (_id) {
      this.setActiveMenu(_id)

      if (document.body.clientWidth <= 768) {
        this.toggleMenu(false)
      }
    }
  }
}
