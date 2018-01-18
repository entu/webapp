<style lang="stylus" scoped>
    .row
        padding-bottom 56px

    #search
        height 56px
        padding-left env(safe-area-inset-left) !important
        border-bottom 1px solid #d1d1d1
        color #6c6c6c

        label
            margin-bottom 0

        .input-group-addon
        .form-control
            padding 0
            border-radius 0
            border none
            background none

        .form-control
            height 24px
            padding-left 10px

            &:focus
                outline none
                box-shadow none

    #list
        overflow-y auto
        overflow-x hidden
        -webkit-overflow-scrolling touch
        padding-left env(safe-area-inset-left) !important

        a
            color inherit

            &:hover
                text-decoration none

        .media
            border-bottom 1px solid #e4e4e4

            &:last-child
                border-bottom none

            img
                padding 2px !important
                border 1px solid #d5d5d5

            .media-body
                p
                    color #919191
</style>



<template lang="pug">
    .h-100.col-12.col-sm-4.col-lg-3
        .row.h-100
            form#search.col-12.p-0.pl-2(action='.')
                .input-group.p-3
                    label.input-group-addon(for='search-field')
                        i.fas.fa-lg.fa-search
                    input#search-field.form-control(type='search')
            #list.h-100.col-12.p-0
                router-link.media.p-3(v-for='e in entities' v-bind:key='e.id' v-bind:to='"/entity/"+e.id', exact)
                    img.rounded-circle.align-self-start.col-2.mr-3(v-bind:src='e.img', v-bind:alt='e.title')
                    .media-body.align-self-center
                        h5.t-0 {{ e.title }}
                        p.mb-0.mt-2 {{ e.description }}
</template>



<script>
    export default {
        data () {
            return {
                entities: [
                    {
                        id: '1',
                        title: 'Cras tempor dui lacus',
                        description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                        img: 'https://lorempixel.com/100/100/abstract/'
                    },
                    {
                        id: '2',
                        title: 'Curabitur sit amet',
                        img: 'https://lorempixel.com/100/100/animals/'
                    },
                    {
                        id: '3',
                        title: 'Vestibulum eu metus',
                        description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                        img: 'https://lorempixel.com/100/100/business/'
                    },
                    {
                        id: '4',
                        title: 'Cras tempor dui lacus',
                        description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                        img: 'https://lorempixel.com/100/100/cats/'
                    },
                    {
                        id: '5',
                        title: 'Curabitur sit amet',
                        description: 'Vivamus ultrices augue ipsum, vitae pellentesque elit imperdiet vitae.',
                        img: 'https://lorempixel.com/100/100/city/'
                    },
                    {
                        id: '6',
                        title: 'Vestibulum eu metus',
                        description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                        img: 'https://lorempixel.com/100/100/fashion/'
                    },
                    {
                        id: '7',
                        title: 'Cras tempor dui lacus',
                        description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                        img: 'https://lorempixel.com/100/100/food/'
                    },
                    {
                        id: '8',
                        title: 'Curabitur sit amet',
                        description: 'Vivamus ultrices augue ipsum, vitae pellentesque elit imperdiet vitae.',
                        img: 'https://lorempixel.com/100/100/nature/'
                    },
                    {
                        id: '9',
                        title: 'Vestibulum eu metus',
                        description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                        img: 'https://lorempixel.com/100/100/nightlife/'
                    },
                    {
                        id: '10',
                        title: 'Cras tempor dui lacus',
                        description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                        img: 'https://lorempixel.com/100/100/people/'
                    },
                    {
                        id: '11',
                        title: 'Vestibulum eu metus',
                        description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                        img: 'https://lorempixel.com/100/100/sports/'
                    },
                    {
                        id: '12',
                        title: 'Cras tempor dui lacus',
                        description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                        img: 'https://lorempixel.com/100/100/technics/'
                    },
                    {
                        id: '13',
                        title: 'Vestibulum eu metus',
                        description: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio,',
                        img: 'https://lorempixel.com/100/100/technics/'
                    },
                    {
                        id: '14',
                        title: 'Cras tempor dui lacus',
                        description: 'Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.',
                        img: 'https://lorempixel.com/100/100/transport/'
                    },
                ]
            }
        }
    }
</script>
