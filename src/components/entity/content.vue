<style lang="stylus" scoped>
    .row
        padding-bottom 56px

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

    #content
        background #fafafa
        border-left 1px solid #d1d1d1
        overflow-y auto
        overflow-x hidden
        -webkit-overflow-scrolling touch
        padding-right env(safe-area-inset-right) !important
</style>



<template lang="pug">
    .col.d-none.d-sm-block
        .row.h-100
            nav.navbar.navbar-expand-sm.col.p-0
                .collapse.navbar-collapse
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
                        li.nav-item.dropdown
                            a.nav-link.dropdown-toggle.p-3(href='#', role='button', data-toggle='dropdown')
                                i.fas.fa-lg.fa-sign-in-alt
                            .dropdown-menu.dropdown-menu-right
                                a.dropdown-item(href='https://api.entu.ee/auth/google?next=https://app.entu.ee/auth/')
                                    i.fab.fa-google
                                    span Google
                                a.dropdown-item(href='https://api.entu.ee/auth/facebook?next=https://app.entu.ee/auth/')
                                    i.fab.fa-facebook
                                    span Facebook
                                a.dropdown-item(href='https://api.entu.ee/auth/microsoft?next=https://app.entu.ee/auth/')
                                    i.fab.fa-microsoft
                                    span Microsoft
                                .dropdown-divider
                                a.dropdown-item(href='#')
                                    i.fas.fa-mobile-alt
                                    span Mobiil-ID
                                a.dropdown-item(href='#')
                                    i.fas.fa-id-card
                                    span ID-kaart
                                //- .dropdown-divider
                                //- a.dropdown-item(href='#')
                                //-     i.fas.fa-university
                                //-     span TAAT
            #content.col-12.h-100.p-0
                .p-3
                    p Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lobortis, elit sit amet posuere ullamcorper, arcu neque commodo augue, fermentum faucibus turpis tellus eu tortor. Cras ultricies nisi a lorem finibus, ac tincidunt lorem eleifend. In vitae velit posuere, elementum erat vel, semper lacus. Nam dictum, orci at consequat volutpat, magna libero dapibus velit, eu consequat nisl sapien et erat. Donec quis nulla urna. Integer purus magna, accumsan vel mollis sit amet, porta tempor quam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam erat volutpat. Etiam fringilla risus sapien, eget hendrerit nisi pulvinar vitae. Morbi magna dui, ultrices quis risus id, tincidunt fringilla lacus. Fusce nisl ante, efficitur tristique ipsum ornare, mollis sagittis turpis. Duis augue dolor, scelerisque a enim eu, vehicula vestibulum ante. Fusce aliquam tellus est, id mattis elit varius ut. Quisque elit elit, pretium vel maximus in, gravida vitae felis.

                    p Donec eleifend pharetra congue. Aliquam ut risus cursus, feugiat mauris quis, eleifend massa. Maecenas pharetra scelerisque leo, non mollis metus imperdiet quis. Fusce viverra libero ante, ac consequat neque volutpat at. Aenean vestibulum pretium magna nec ultricies. Quisque sollicitudin lacinia libero, at semper justo ullamcorper et. Nullam ac rhoncus dolor, vitae pulvinar risus. Donec venenatis quam id nisi pharetra, nec vestibulum purus ornare. Nam elementum mi ex. Morbi bibendum molestie orci, ut tempus nunc auctor eu. Pellentesque molestie a ipsum quis aliquam. Aliquam eu nisi ipsum. Vivamus tempus, metus quis tristique ultrices, nunc eros rutrum sem, id luctus tellus mauris vitae neque. Praesent et consequat tortor.

                    p Curabitur sit amet elementum ipsum. Vivamus ultrices augue ipsum, vitae pellentesque elit imperdiet vitae. Duis luctus arcu ut tortor tempor, nec lacinia tortor efficitur. Nullam in neque tortor. Praesent posuere placerat augue, vel porta turpis tincidunt quis. Vestibulum eu metus sit amet elit molestie feugiat eget vitae massa. Fusce sagittis tincidunt metus, vel porta ipsum porttitor non. Cras tempor dui lacus, vel elementum leo facilisis a. Nunc mauris est, mattis quis mi eget, pellentesque vestibulum dolor. Vestibulum nunc nibh, posuere vel posuere quis, blandit ac nunc. Sed ullamcorper tortor mi, quis accumsan nisi ultrices id. Mauris eget condimentum elit, et mattis quam. Vivamus dignissim risus in lectus eleifend posuere. Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.
</template>



<script>
    export default {
        data () {
            return {

            }
        }
    }
</script>
