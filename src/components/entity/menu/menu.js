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

    const headers = new Headers({
        Authorization: `Bearer ${accounts[account].token}`
    })

    fetch(`https://api.entu.ee/entity/${accounts[account]._id}?props=forename.string,forename.language,surname.string,surname.language,photo._id`, { headers: headers })
        .then(res => {
            if (!res.ok) {
                throw new TypeError(res.statusText)
            } else {
                return res.json()
            }
        })
        .then(data => {
            callback(null, {
                name: [getValue(data.forename), getValue(data.forename)].join(' '),
                photo: data.photo[0]._id
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

    const headers = new Headers({
        Authorization: `Bearer ${accounts[account].token}`
    })

    fetch(`https://api.entu.ee/property/${_id}`, { headers: headers })
        .then(res => {
            if (!res.ok) {
                throw new TypeError(res.statusText)
            } else {
                return res.json()
            }
        })
        .then(data => {
            callback(null, data.url)
        })
        .catch(err => {
            callback(err)
        })
}



const getMenu = (route, callback) => {
    const account = route.params.account
    const accounts = JSON.parse(sessionStorage.getItem('accounts'))
    let options = {}

    if (accounts && accounts[account] && accounts[account].token) {
        options.headers = new Headers({
            Authorization: `Bearer ${accounts[account].token}`
        })
    }

    fetch(`https://api.entu.ee/entity?account=${account}&_type.string=menu&props=group.string,group.language,title.string,title.language,query.string`, options)
        .then(res => {
            if (!res.ok) {
                throw new TypeError(res.statusText)
            } else {
                return res.json()
            }
        })
        .then(data => {
            if (!data || !data.entities) { return callback(new TypeError('No menu')) }

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
                    _id: entity._id,
                    title: getValue(entity.title),
                    query: entity._id
                })
            })

            callback(null, Object.values(menu))
        }).catch(err => {
            callback(err)
        })
}



export default {
    name: 'EntityMenu',
    created() {
        locale = this.locale

        getUser(this.$route, (err, person) => {
            if (err) { return console.log(err) }

            if (person && person.photo) {
                getPhoto(person.photo, this.$route, (err, url) => {
                    this.user = person
                    this.user.photo = url
                })
            }
        })

        getMenu(this.$route, (err, menu) => {
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
