<template lang="pug">
    p info
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
