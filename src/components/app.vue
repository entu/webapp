<style lang="stylus">
    html
    body
        height 100%

    body
        font-family Avenir, 'Helvetica Neue', Helvetica, Arial, sans-serif !important
        -webkit-font-smoothing antialiased
        -moz-osx-font-smoothing grayscale

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



<script>
    import info from './info/info.vue'
    import auth from './auth/auth.vue'
    import entity from './entity/entity.vue'

    export default {
        name: 'app',
        components: {
            'show-info': info,
            'show-auth': auth,
            'show-entity': entity
        },
        data () {
            return {

            }
        },
        methods: {

        }
    }
</script>
