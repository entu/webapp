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

                span
                    padding-left 10px

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
    #menu.h-100
        .p-3
            a#toggle-menu(href='#')
                i.fas.fa-bars.float-right

        #menu-content.p-3
            img.mb-3.rounded-circle.mx-auto.d-block(src='https://lorempixel.com/100/100/cats/', alt='')

            h4.pb-3.text-center Donec Vitae Pellentesque
            ul.list-unstyled
                li.menu-group.mt-4
                    a(href='#')
                        h5.mb-1
                            i.fas.fa-angle-down
                            span Quisque sit
                    ul.list-unstyled(style='display:block')
                        li
                            a(href='#') Aliquam
                        li
                            a(href='#') Maecenas
                        li
                            a(href='#') Fusce fermentum
                li.menu-group.mt-4
                    a(href='#')
                        h5.mb-1
                            i.fas.fa-angle-right
                            span Aenean
                    ul.list-unstyled
                        li
                            a(href='#') Quisque
                        li
                            a(href='#') Nullam
                li.menu-group.mt-4
                    a(href='#')
                        h5.mb-1
                            i.fas.fa-angle-right
                            span Donec
                    ul.list-unstyled
                        li
                            a(href='#') Nam
                        li
                            a(href='#') Morbi
</template>



<script>
    export default {
        data () {
            return {

            }
        }
    }
</script>
