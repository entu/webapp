<style lang="stylus" scoped>
    #info
        font-family 'Avenir', Helvetica, Arial, sans-serif
        -webkit-font-smoothing antialiased
        -moz-osx-font-smoothing grayscale
        text-align center
        color #2c3e50
        margin-top 60px

    h1
    h2
        font-weight normal

    ul
        list-style-type none
        padding 0

    li
        display inline-block
        margin 0 10px

    a
        color #42b983
</style>



<template lang="pug">
    #info
        router-link(to='/', exact)
            img(src='../../assets/logo.png')
            h1 Entu
        router-link(to='/auth', exact) Auth
        router-link(to='/entity', exact) Entity
</template>



<script>
    export default {
        created() {
            this.$router.push('/entity')
        },
        data () {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        }
    }
</script>
