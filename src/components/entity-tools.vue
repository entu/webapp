<style lang="stylus" scoped>
    nav
        height 56px
        padding-right env(safe-area-inset-right) !important
        border-bottom 1px solid #d1d1d1

        a
            color #6c6c6c

            &:hover
                color #3b3b3b
                text-decoration none

        .dropdown:hover>.dropdown-menu
            display block

        .dropdown-toggle::after
            display none

        .nav-item.dropdown.show
            a
                color #3b3b3b
                text-decoration none
                outline none

        .dropdown-menu-right
            border-radius 0
            border 1px solid #d1d1d1
            border-top none
            top 54px
            min-width 180px

            .dropdown-item
                span
                    margin-left 10px

                &:active
                    color #ffffff !important
                    background #3b3b3b
</style>



<template lang="pug">
    nav.navbar.navbar-expand-sm.col.p-0
        .collapse.navbar-collapse.pr-2
            ul.navbar-nav.ml-sm-auto
                li.nav-item
                    a.nav-link.p-3(href='#')
                        i.fas.fa-lg.fa-plus
                li.nav-item
                    a.nav-link.p-3(href='#')
                        i.fas.fa-lg.fa-pencil-alt
                li.nav-item
                    a.nav-link.p-3(href='#')
                        i.fas.fa-lg.fa-copy
                li.nav-item
                    a.nav-link.p-3(href='#')
                        i.fas.fa-lg.fa-arrow-up
                li.nav-item
                    a.nav-link.p-3(href='#')
                        i.fas.fa-lg.fa-unlock
                li.nav-item
                    a.nav-link.p-3(href='#')
                        i.fas.fa-lg.fa-share-square
                li.nav-item
                    router-link.nav-link.p-3(:to="{ name: 'auth' }")
                        i.fas.fa-lg.fa-sign-in-alt
</template>



<script></script>
