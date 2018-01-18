<template lang="pug">
    .row.h-100
        .h-100.col-lg-2.d-none.d-lg-block.p-0
            entity-menu

        .h-100.col-12.col-sm-4.col-lg-3
            entity-list

        .h-100.col.d-none.d-sm-block
            entity-content
</template>



<style lang="stylus" scoped></style>



<script>
    import menu from './menu.vue'
    import list from './list.vue'
    import content from './content.vue'

    export default {
        components: {
            'entity-menu': menu,
            'entity-list': list,
            'entity-content': content
        },
        data () {
            return {

            }
        }
    }
</script>
