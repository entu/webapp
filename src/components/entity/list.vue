<style lang="stylus" scoped>
    #search
        height 56px
        padding-left env(safe-area-inset-left) !important
        border-bottom 1px solid #d1d1d1
        color #6c6c6c

        .input-group-addon
        .form-control
            padding 0px
            border-radius 0px
            border none
            background none

        .form-control
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
    .row.h-100(style='padding-bottom:56px')
        form#search.col-12.p-0.pl-2(action='.')
            .input-group.p-3
                label.input-group-addon(for='search-field')
                    i.fas.fa-lg.fa-search
                input#search-field.form-control(type='search')
        #list.h-100.col-12.p-0
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/abstract/', alt='')
                .media-body.align-self-center
                    h5.m-0 Cras tempor dui lacus
                    p.mb-0.mt-2 Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/animals/', alt='')
                .media-body.align-self-center
                    h5.t-0 Curabitur sit amet
                    p.mb-0.mt-2 Vivamus ultrices augue ipsum, vitae pellentesque elit imperdiet vitae.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/business/', alt='')
                .media-body.align-self-center
                    h5.t-0 Vestibulum eu metus
                    p.mb-0.mt-2 Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/cats/', alt='')
                .media-body.align-self-center
                    h5.m-0 Cras tempor dui lacus
                    p.mb-0.mt-2 Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/city/', alt='')
                .media-body.align-self-center
                    h5.t-0 Curabitur sit amet
                    p.mb-0.mt-2 Vivamus ultrices augue ipsum, vitae pellentesque elit imperdiet vitae.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/fashion/', alt='')
                .media-body.align-self-center
                    h5.t-0 Vestibulum eu metus
                    p.mb-0.mt-2 Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/food/', alt='')
                .media-body.align-self-center
                    h5.m-0 Cras tempor dui lacus
                    p.mb-0.mt-2 Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/nature/', alt='')
                .media-body.align-self-center
                    h5.t-0 Curabitur sit amet
                    p.mb-0.mt-2 Vivamus ultrices augue ipsum, vitae pellentesque elit imperdiet vitae.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/nightlife/', alt='').align-sel-center
                .media-body
                    h5.mt-0 Vestibulum eu metus
                    p.mb-0.mt-2 Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/people/', alt='')
                .media-body.align-self-center
                    h5.m-0 Cras tempor dui lacus
                    //- p.mb-0.mt-2 Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/sports/', alt='')
                .media-body.align-self-center
                    h5.t-0 Vestibulum eu metus
                    p.mb-0.mt-2 Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/technics/', alt='')
                .media-body.align-self-center
                    h5.m-0 Cras tempor dui lacus
                    //- p.mb-0.mt-2 Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/technics/', alt='')
                .media-body.align-self-center
                    h5.t-0 Vestibulum eu metus
                    p.mb-0.mt-2 Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at.
            a.media.p-3(href='#')
                img.rounded-circle.align-self-start.col-2.mr-3(src='https://lorempixel.com/100/100/transport/', alt='').align-sel-center
                .media-body
                    h5.mt-0 Cras tempor dui lacus
                    p.mb-0.mt-2 Etiam euismod mauris in maximus varius. Quisque sit amet purus sed elit porta accumsan.
</template>



<script>
    export default {
        data () {
            return {

            }
        }
    }
</script>
