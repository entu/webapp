<style lang="stylus" scoped>
    .background
    .content
        position fixed
        top 0
        right 0
        bottom 0
        left 0

    .background
        z-index 1

        -webkit-filter blur(7px)
        -moz-filter blur(7px)
        -o-filter blur(7px)
        -ms-filter blur(7px)
        filter blur(7px)

        -webkit-transform scale(1.02)
        -moz-transform scale(1.02)
        -o-transform scale(1.02)
        -ms-transform scale(1.02)
        transform scale(1.02)

        background-repeat no-repeat
        background-position center
        background-size cover

        &.bg-1
            background-image url('../assets/backgrounds/bg-1.png')
        &.bg-2
            background-image url('../assets/backgrounds/bg-2.png')
        &.bg-3
            background-image url('../assets/backgrounds/bg-3.png')
        &.bg-4
            background-image url('../assets/backgrounds/bg-4.png')
        &.bg-5
            background-image url('../assets/backgrounds/bg-5.png')
        &.bg-6
            background-image url('../assets/backgrounds/bg-6.png')
        &.bg-7
            background-image url('../assets/backgrounds/bg-7.png')
        &.bg-8
            background-image url('../assets/backgrounds/bg-8.png')
        &.bg-9
            background-image url('../assets/backgrounds/bg-9.png')
        &.bg-10
            background-image url('../assets/backgrounds/bg-10.png')
        &.bg-11
            background-image url('../assets/backgrounds/bg-11.png')
        &.bg-12
            background-image url('../assets/backgrounds/bg-12.png')

    .content
        z-index 9

        .borderbox
            overflow-y auto
            background rgba(255, 255, 255, 0.95)
            border-right 1px solid #d1d1d1
            border-left 1px solid #d1d1d1

            h1
                font-size 34px

            li
                border-top 1px solid #e4e4e4

                &:first-child
                    border-top none

                a
                    display block
                    padding 10px
                    padding-left 40px
                    color inherit

                    &:hover
                        color inherit
                        text-decoration none

                        .fa-google
                            color: #e22c29
                        .fa-facebook
                            color: #39579a
                        .fa-microsoft
                            color: #0070c9
                        .fa-mobile-alt
                            color: #f04822
                        .fa-id-card
                            color: #3d89f7
                        .fa-university
                            color: #369a21
                        .fa-database
                            color: #3399ff
                        .fa-sign-out-alt
                            color: #cc0033

                        span
                            font-weight bold

                    i
                        text-align center
                        height 16px
                        width 16px

                    span
                        padding-left 10px

            p
                font-size 14px
</style>



<template lang="pug">
    div
        .background(:class='background')
        .content.row.justify-content-center
            .borderbox.h-100.col-xs-12.col-sm-6.col-md-4.col-lg-3.col-xl-2
                .row.h-100(v-show='!this.authenticating && !accounts')
                    .col-12
                        h1.text-center.mt-5.mb-5 Logi sisse
                        ul.list-unstyled
                            li
                                a(:href='"https://api.entu.ee/auth/google?next=" + host + "/auth/"')
                                    i.fab.fa-google
                                    span Google
                            li
                                a(:href='"https://api.entu.ee/auth/facebook?next=" + host + "/auth/"')
                                    i.fab.fa-facebook
                                    span Facebook
                            li
                                a(:href='"https://api.entu.ee/auth/microsoft?next=" + host + "/auth/"')
                                    i.fab.fa-microsoft
                                    span Microsoft
                            li(style='border-color:#bebebe')
                                a(href='')
                                    i.fas.fa-mobile-alt
                                    span Mobiil-ID
                            li
                                a(href='')
                                    i.fas.fa-id-card
                                    span ID-kaart
                            li(style='border-color:#bebebe')
                                a(href='')
                                    i.fas.fa-university
                                    span TAAT
                    .col-12.align-self-end
                        p.text-center Entu.ee kasutab autentimiseks ülaltoodud teenusepakkujaid. Teie kasutajanime ega parooli meile ei edastata.
                .row.h-100(v-show='accounts && accounts.length > 0')
                    .col-12
                        h1.text-center.mt-5.mb-5 Vali andmebaas
                        ul.list-unstyled
                            li(v-for='a in accounts')
                                router-link(:to="{ name: 'menu', params: { account: a.account } }")
                                    i.fas.fa-database
                                    span {{ a.account }}
                            li(style='border-color:#bebebe')
                                a(href='', @click.prevent='logOut')
                                    i.fas.fa-sign-out-alt
                                    span Välju
                .row.h-100(v-show='authenticating')
                    .col-12.align-self-center.text-center
                        i.fas.fa-spinner.fa-pulse
</template>



<script>
    export default {
        created() {
            if (this.$route.params.id === 'out') {
                this.logOut()
            } else if (this.$route.params.id) {
                this.authenticating = true

                const options = {
                    headers: {
                        Authorization: `Bearer ${this.$route.params.id}`
                    }
                }

                this.$http.get('https://api.entu.ee/auth', options).then(function (data) {
                    return data.json()
                }).then(function (data) {
                    this.accounts = Object.values(data)

                    this.authenticating = false

                    if (this.accounts.length === 1) {
                        this.$router.push({ name: 'menu', params: { account: this.accounts[0].account } })
                    } else if (this.accounts.length > 0) {
                        sessionStorage.setItem('accounts', JSON.stringify(data))
                    } else {
                        this.accounts = null
                    }
                }).catch(function (data) {
                    console.log(data)
                    this.$router.push({ name: 'auth' })
                })
            }

            const accounts = JSON.parse(sessionStorage.getItem('accounts'))
            if (!this.accounts && accounts) {
                this.accounts = Object.values(accounts)
            }
        },
        data () {
            return {
                host: window.location.origin,
                background: `bg-${Math.ceil(Math.random()*12)}`,
                authenticating: false,
                accounts: null
            }
        },
        methods: {
            logOut () {
                this.accounts = null
                this.authenticating = false
                sessionStorage.removeItem('accounts')
            }
        }
    }
</script>
