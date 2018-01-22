<style lang="stylus" scoped>
    #menu
        background #323333
        color #ffffff
        overflow-y auto
        overflow-x hidden
        -webkit-overflow-scrolling touch

        img.border
            padding 2px !important
            border 1px solid #d5d5d5

        a
            color #ffffff

            &:hover
                text-decoration none

        h4
            font-size 18px
            line-height 20px
            font-weight 400
            // letter-spacing 1px

        .menu-group
            h5
                font-size 16px
                line-height 16px
                font-weight 700
                text-transform uppercase
                letter-spacing 1px
                text-overflow ellipsis
                white-space nowrap
                overflow hidden

                i
                    width 20px
                    height 20px

            ul
                display none
                margin-left 22px

                li
                    display block
                    font-weight 200
                    line-height 26px
                    letter-spacing 0.8px
                    text-overflow ellipsis
                    white-space nowrap
                    overflow hidden

                    &:hover
                        font-weight 500

                    a.router-link-exact-active
                        font-weight 700

    .fade-enter-active
    .fade-leave-active
        transition opacity .2s

    .fade-enter
    .fade-leave-to
        opacity 0
</style>



<template lang="pug">
    #menu.h-100.d-none.d-lg-block.p-0(:class='{ "col-lg-2": !closed, "col-auto": closed }')
        .p-3
            a(href='', @click.prevent='closed = !closed')
                i.fas.fa-bars.float-left
            router-link(v-show='!closed', :to="{ name: 'auth' }")
                i.fas.fa-sign-in-alt.float-right(v-if='!authenticated')
                i.fas.fa-sign-out-alt.float-right(v-if='authenticated')
        #menu-content.p-3(v-show='!closed')
            img.border.col-5.mb-3.rounded-circle.mx-auto.d-block(v-if='user.photo', :src='user.photo', :alt='user.name')
            img.col-6.mb-3.mx-auto.d-block(v-if='!user.photo', src='../assets/logo.png', :alt='user.name')

            //- h4.pb-3.text-center {{ user.name }}
            ul.list-unstyled
                li.menu-group.mt-4(v-for='mg in menu')
                    a(href='', @click.prevent='mg.active = !mg.active')
                        h5.mb-1
                            i.fas(:class='{ "fa-angle-down": mg.active, "fa-angle-right": !mg.active }')
                            span {{ mg.title }}
                    ul.list-unstyled(v-show='mg.active', style='display:block')
                        li(v-for='l in mg.links')
                            router-link(:to="{ name: 'list', params: { query: l.query } }", exact) {{ l.title }}
        .col.mt-5.text-center(v-if='menu.length === 0')
            i.fas.fa-spinner.fa-pulse
</template>



<script>
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
            options.headers = {
                Authorization: `Bearer ${accounts[account].token}`
            }
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
        let options = {}

        const account = route.params.account
        const accounts = JSON.parse(sessionStorage.getItem('accounts'))

        if (accounts && accounts[account] && accounts[account]._id && accounts[account].token) {
            options.headers = {
                Authorization: `Bearer ${accounts[account].token}`
            }
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
            options.headers = {
                Authorization: `Bearer ${accounts[account].token}`
            }
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
            locale = this.$i18n.locale

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
        },
        computed: {
            authenticated () {
                const account = this.$route.params.account
                const accounts = JSON.parse(sessionStorage.getItem('accounts'))

                return accounts && accounts[account] && accounts[account].token
            }
        },
        watch: {
            locale (val) {
                this.$i18n.locale = val
            }
        }
    }
</script>
