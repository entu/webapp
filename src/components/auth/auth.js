export default {
    created() {
        if (this.$route.params.id === 'out') {
            this.logOut()
        } else if (this.$route.params.id) {
            this.authenticating = true

            const options = {
                headers: {
                    Authorization: `Bearer ${this.$route.params.id}`
                }
            }

            this.$http.get('https://api.entu.ee/auth', options).then(function (data) {
                return data.json()
            }).then(function (data) {
                this.accounts = Object.values(data)

                this.authenticating = false

                if (this.accounts.length === 1) {
                    this.$router.push({ name: 'menu', params: { account: this.accounts[0].account } })
                } else if (this.accounts.length > 0) {
                    sessionStorage.setItem('accounts', JSON.stringify(data))
                } else {
                    this.accounts = null
                }
            }).catch(function (data) {
                console.log(data)
                this.$router.push({ name: 'auth' })
            })
        }

        const accounts = JSON.parse(sessionStorage.getItem('accounts'))
        if (!this.accounts && accounts) {
            this.accounts = Object.values(accounts)
        }
    },
    data () {
        return {
            host: window.location.origin,
            authenticating: false,
            accounts: null
        }
    },
    computed: {
        background () {
            return 'bg-' + Math.ceil(Math.random() * 12)
        }
    },
    methods: {
        logOut () {
            this.accounts = null
            this.authenticating = false
            sessionStorage.removeItem('accounts')
        }
    }
}
