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


const getUser = (route, http, callback) => {
    let options = {
        headers: {},
        params: {
            'props': [
                'forename.string',
                'forename.language',
                'surname.string',
                'surname.language',
                'photo._id'
            ].join(',')
        }
    }

    const account = route.params.account
    const accounts = JSON.parse(sessionStorage.getItem('accounts'))

    if (accounts && accounts[account] && accounts[account]._id && accounts[account].token) {
        options.headers.Authorization = `Bearer ${accounts[account].token}`
    } else {
        return callback(null, null)
    }

    http.get(`https://api.entu.ee/entity/${accounts[account]._id}`, options).then(data => {
        return data.json()
    }).then(data => {
        callback(null, {
            name: [getValue(data.forename), getValue(data.forename)].join(' '),
            photo: data.photo[0]._id
        })
    }).catch(data => {
        callback(data)
    })
}


const getPhoto = (_id, route, http, callback) => {
    let options = {
        headers: {}
    }

    const account = route.params.account
    const accounts = JSON.parse(sessionStorage.getItem('accounts'))

    if (accounts && accounts[account] && accounts[account]._id && accounts[account].token) {
        options.headers.Authorization = `Bearer ${accounts[account].token}`
    } else {
        return callback(null, null)
    }

    http.get(`https://api.entu.ee/property/${_id}`, options).then(data => {
        return data.json()
    }).then(data => {
        callback(null, data.url)
    }).catch(data => {
        callback(data)
    })
}


const getMenu = (route, http, callback) => {
    let options = {
        headers: {},
        params: {
            '_type.string': 'menu',
            'props': [
                'group.string',
                'group.language',
                'title.string',
                'title.language',
                'query.string'
            ].join(',')
        }
    }

    const account = route.params.account
    const accounts = JSON.parse(sessionStorage.getItem('accounts'))

    if (accounts && accounts[account] && accounts[account].token) {
        options.headers.Authorization = `Bearer ${accounts[account].token}`
    } else {
        options.params.account = account
    }

    http.get('https://api.entu.ee/entity', options).then(data => {
        return data.json()
    }).then(data => {
        if (!data || !data.entities) { return }

        let menu = {}

        data.entities.forEach((entity) => {
            let group = getValue(entity.group)
            if (!menu[group]) {
                menu[group] = {
                    title: getValue(entity.group),
                    links: [],
                    active: false
                }
            }
            menu[group].links.push({
                title: getValue(entity.title),
                query: entity._id
            })
        })

        callback(null, Object.values(menu))
    }).catch(data => {
        callback(data)
    })
}


export default {
    created() {
        locale = sessionStorage.getItem('locale')
        this.$i18n.locale = locale

        getUser(this.$route, this.$http, (err, person) => {
            if (err) { return console.log(err) }

            if (person && person.photo) {
                getPhoto(person.photo, this.$route, this.$http, (err, url) => {
                    this.user = person
                    this.user.photo = url
                })
            }
        })

        getMenu(this.$route, this.$http, (err, menu) => {
            if (err) { return console.log(err) }

            this.menu = menu
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
            menu: []
        }
    }
}
