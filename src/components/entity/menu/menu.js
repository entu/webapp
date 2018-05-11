export default {
  name: 'EntityMenu',
  data () {
    return {
      user: {
        name: null,
        photo: null
      },
      closed: false,
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

      this.axios.get(`/entity/${this.userId}`, options).then((response) => {
        this.user.name = [this.getValue(response.data.forename), this.getValue(response.data.forename)].join(' ')

        if (!response.data.photo) { return }

        this.axios.get(`/property/${response.data.photo[0]._id}`).then((response) => {
          this.user.photo = response.data.url
          delete this.user.photoId
        })
      })
    },
    getMenu () {
      const sorter = (a, b) => {
        if (!a.title || a.title < b.title) { return -1 }
        if (!b.title || a.title > b.title) { return 1 }
        return 0
      }

      const options = {
        params: {
          '_type.string': 'menu',
          props: [
            'group.string',
            'group.language',
            'title.string',
            'title.language',
            'query.string'
          ].join(',')
        }
      }

      this.axios.get('/entity', options).then((response) => {
        if (!response.data || !response.data.entities) { return }

        let menu = {}

        response.data.entities.forEach((entity) => {
          let group = this.getValue(entity.group)

          if (!menu[group]) {
            menu[group] = {
              title: this.getValue(entity.group),
              links: [],
              active: false
            }
          }

          menu[group].links.push({
            _id: entity._id,
            title: this.getValue(entity.title),
            query: this.getValue(entity.query)
          })
        })

        this.menu = Object.values(menu)

        this.menu.forEach((m) => {
          m.links.sort(sorter)
        })
        this.menu.sort(sorter)

        this.menu[0].active = true
      })
    }
  }
}
