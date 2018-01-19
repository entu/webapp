<template lang="pug">
    .h-100.col
        .row.h-100
            entity-list
            entity-content
</template>



<style lang="stylus" scoped></style>



<script>
    import list from './list.vue'
    import content from './content.vue'

    export default {
        components: {
            'entity-list': list,
            'entity-content': content
        },
        data () {
            return {

            }
        }
    }
</script>
