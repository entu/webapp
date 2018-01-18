<style lang="stylus">
    html
    body
        height 100%
</style>



<template lang="pug">
    .container-fluid.h-100
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
