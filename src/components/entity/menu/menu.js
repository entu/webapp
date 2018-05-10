import { get } from 'axios'

export default {
  name: 'EntityMenu',
  created () {
    this.getUser()
    this.getMenu()
  },
  data () {
    return {
      user: {
        name: null,
        photo: null
      },
      closed: false,
      menu: [],
      menuQueries: {},
      entity: this.$route.params.entity
    }
  },
  methods: {
    getUser () {
      if (!this.userId || !this.token) { return }

      const headers = {
        Authorization: `Bearer ${this.token}`
      }
      const options = {
        headers: headers,
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

      get(`https://api.entu.app/entity/${this.userId}`, options)
        .then(response => {
          this.user.name = [this.getValue(response.data.forename), this.getValue(response.data.forename)].join(' ')

          if (!response.data.photo) { return }

          get(`https://api.entu.app/property/${response.data.photo[0]._id}`, { headers: headers })
            .then(response => {
              this.user.photo = response.data.url
              delete this.user.photoId
            })
            .catch(err => {
              console.error(err)
            })
        })
        .catch(err => {
          console.error(err)
        })
    },
    getMenu () {
      let options = {
        params: {
          account: this.account,
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

      if (this.token) {
        options.headers = {
          Authorization: `Bearer ${this.token}`
        }
      }

      get(`https://api.entu.app/entity`, options)
        .then(response => {
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
              query: entity._id
            })

            this.menuQueries[entity._id] = this.getValue(entity.query)
          })

          this.menu = Object.values(menu)
          this.menu[0].active = true
        }).catch(err => {
          console.error(err)
        })
    }
  }
}
