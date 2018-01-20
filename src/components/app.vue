<style lang="stylus">
    html
    body
        height 100%

    body
        font-family Avenir, 'Helvetica Neue', Helvetica, Arial, sans-serif !important
        -webkit-font-smoothing antialiased
        -moz-osx-font-smoothing grayscale

        a
        input
            outline 0

        a
            color inherit

            &:hover
                color inherit
                text-decoration none

        .fade-enter-active
        .fade-leave-active
            transition opacity .6s

        .fade-enter
        .fade-leave-to
            opacity 0
</style>



<template lang="pug">
    .container-fluid.h-100
        transition(name='fade')
            router-view
</template>



<script></script>
