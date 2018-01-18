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
            font-size 20px
            line-height 24px
            font-weight 400
            // letter-spacing 1px

        .menu-group
            h5
                font-weight 500
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
                margin-left 25px

                li
                    display block
                    font-weight 200
                    line-height 26px
                    letter-spacing 0.8px
                    text-overflow ellipsis
                    white-space nowrap
                    overflow hidden
</style>



<template lang="pug">
    #menu.h-100.d-none.d-lg-block.p-0(v-bind:class='{ "col-lg-2": !closed, "col-auto": closed }')
        .p-3
            a(href='', v-on:click.prevent='closed = !closed')
                i.fas.fa-bars.float-right

        #menu-content.p-3(v-if='!closed')
            img.mb-3.rounded-circle.mx-auto.d-block(src='https://lorempixel.com/100/100/cats/', alt='')

            h4.pb-3.text-center Donec Vitae Pellentesque
            ul.list-unstyled
                li.menu-group.mt-4(v-for='mg in menu')
                    a(href='', v-on:click.prevent='mg.active = !mg.active')
                        h5.mb-1
                            i.fas(v-bind:class='{ "fa-angle-down": mg.active, "fa-angle-right": !mg.active }')
                            span {{ mg.title }}
                    ul.list-unstyled(v-show='mg.active', style='display:block')
                        li(v-for='l in mg.links')
                            a(href='') {{ l.title }}
</template>



<script>
    export default {
        data () {
            return {
                closed: false,
                menu: [
                    {
                        active: false,
                        title: 'Quisque sit',
                        links: [
                            { title: 'Aliquam', url: '' },
                            { title: 'Maecenas', url: '' },
                            { title: 'Fusce fermentum', url: '' }
                        ]
                    },
                    {
                        active: false,
                        title: 'Aenean',
                        links: [
                            { title: 'Quisque', url: '' },
                            { title: 'Nullam', url: '' }
                        ]
                    },
                    {
                        active: false,
                        title: 'Donec',
                        links: [
                            { title: 'Nam', url: '' },
                            { title: 'Morbi', url: '' }
                        ]
                    },
                ]
            }
        }
    }
</script>
