<style lang="stylus" scoped>
    #menu
        background #323333
        color #ffffff
        overflow-y auto
        overflow-x hidden
        -webkit-overflow-scrolling touch

        img
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
                i.fas.fa-bars.float-right
        #menu-content.p-3(v-show='!closed')
            img.mb-3.rounded-circle.mx-auto.d-block(src='https://lorempixel.com/100/100/cats/', alt='')

            h4.pb-3.text-center Donec Vitae Pellentesque
            ul.list-unstyled
                li.menu-group.mt-4(v-for='mg in menu')
                    a(href='', @click.prevent='mg.active = !mg.active')
                        h5.mb-1
                            i.fas(:class='{ "fa-angle-down": mg.active, "fa-angle-right": !mg.active }')
                            span {{ mg.title }}
                    ul.list-unstyled(v-show='mg.active', style='display:block')
                        li(v-for='l in mg.links')
                            a(href='') {{ l.title }}
</template>



<script>
    const getValue = function (valueList) {
        const language = 'et'
        let values = []

        valueList.forEach(function (v) {
            if (!v.language || v.language === language) {
                values.push(v.string)
            }
        })

        return values[0]
    }

    export default {
        created() {
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

            const account = this.$route.params.account
            const accounts = JSON.parse(sessionStorage.getItem('accounts'))

            if (accounts && accounts[account] && accounts[account].token) {
                options.headers = {
                    Authorization: `Bearer ${accounts[account].token}`
                }
            } else {
                options.params.account = account
            }
            console.log(options);

            this.$http.get('https://api.entu.ee/entity', options).then(function (data) {
                return data.json()
            }).then(function (data) {
                if (!data.entities) { return }

                let menu = {}

                data.entities.forEach(function (entity) {
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
                        url: getValue(entity.query)
                    })
                })

                this.menu = Object.values(menu)

                this.menu[0].active = true
            }).catch(function (data) {
                console.log(data);
            })
        },
        data () {
            return {
                token: null,
                closed: false,
                menu: []
            }
        }
    }
</script>
