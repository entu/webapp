<template lang="pug">
    pre {{ tokens }}
</template>
<style lang="stylus" scoped></style>
<script>
    export default {
        created() {
            if (!this.$route.params.id) { return }

            const options = {
                headers: {
                    Authorization: `Bearer ${this.$route.params.id}`
                }
            }

            this.$http.get('https://api.entu.ee/auth', options).then(function (data) {
                return data.json()
            }).then(function (data) {
                sessionStorage.setItem('token', data.kogumelugu.token)
                this.$router.push('/entity')
            })
        },
        data () {
            return {
                tokens: {}
            }
        }
    }
</script>
