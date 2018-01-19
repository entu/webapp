<template lang="pug">
    .row.h-100
        entity-menu
        router-view
</template>



<style lang="stylus" scoped></style>



<script>
    import menu from './menu.vue'

    export default {
        components: {
            'entity-menu': menu
        },
        data () {
            return {

            }
        }
    }
</script>
