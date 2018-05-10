import { get } from 'axios'

var locale

const getValue = (valueList) => {
  let values = []

  valueList.forEach((v) => {
    if (!v.language || v.language === locale) {
      values.push(v.string)
    }
  })

  return values[0]
}

const getUser = (route, callback) => {
  const account = route.params.account
  const accounts = JSON.parse(sessionStorage.getItem('accounts'))

  if (!accounts || !accounts[account] || !accounts[account]._id || !accounts[account].token) {
    return callback(null, null)
  }

  const options = {
    headers: {
      Authorization: `Bearer ${accounts[account].token}`
    },
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

  get(`https://api.entu.app/entity/${accounts[account]._id}`, options)
    .then(response => {
      callback(null, {
        name: [getValue(response.data.forename), getValue(response.data.forename)].join(' '),
        photo: response.data.photo[0]._id
      })
    })
    .catch(err => {
      callback(err)
    })
}

const getPhoto = (_id, route, callback) => {
  const account = route.params.account
  const accounts = JSON.parse(sessionStorage.getItem('accounts'))

  if (!accounts || !accounts[account] || !accounts[account]._id || !accounts[account].token) {
    return callback(null, null)
  }

  const options = {
    headers: {
      Authorization: `Bearer ${accounts[account].token}`
    }
  }

  get(`https://api.entu.app/property/${_id}`, options)
    .then(response => {
      callback(null, response.data.url)
    })
    .catch(err => {
      callback(err)
    })
}

const getMenu = (route, callback) => {
  const account = route.params.account
  const accounts = JSON.parse(sessionStorage.getItem('accounts'))
  let options = {
    params: {
      account: account,
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

  if (accounts && accounts[account] && accounts[account].token) {
    options.headers = {
      Authorization: `Bearer ${accounts[account].token}`
    }
  }

  get(`https://api.entu.app/entity`, options)
    .then(response => {
      if (!response.data || !response.data.entities) { return callback(new TypeError('No menu')) }

      let menu = {}
      let menuQueries = {}

      response.data.entities.forEach((entity) => {
        let group = getValue(entity.group)
        if (!menu[group]) {
          menu[group] = {
            title: getValue(entity.group),
            links: [],
            active: false
          }
        }
        menu[group].links.push({
          _id: entity._id,
          title: getValue(entity.title),
          query: entity._id
        })
        menuQueries[entity._id] = getValue(entity.query)
      })

      callback(null, {
        menu: Object.values(menu),
        queries: menuQueries
      })
    }).catch(err => {
      callback(err)
    })
}

export default {
  name: 'EntityMenu',
  created () {
    locale = this.locale

    getUser(this.$route, (err, person) => {
      if (err) { return console.log(err) }

      if (person && person.photo) {
        getPhoto(person.photo, this.$route, (err, url) => {
          if (err) {
            console.error(err)
          } else {
            this.user.photo = url
          }
          this.user = person
        })
      }
    })

    getMenu(this.$route, (err, menu) => {
      if (err) { return console.log(err) }

      this.menu = menu.menu
      this.menuQueries = menu.queries
      this.menu[0].active = true
    })
  },
  data () {
    return {
      token: null,
      closed: false,
      user: {
        name: null,
        photo: null
      },
      menu: [],
      entity: this.$route.params.entity
    }
  },
  computed: {

  }
}
