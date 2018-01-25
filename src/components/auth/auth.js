export default {
    name: 'Auth',
    created() {
        if (this.$route.params.id === 'out') {
            this.logOut()
        } else if (this.$route.params.id) {
            this.authenticating = true

            const headers = new Headers({
                Authorization: `Bearer ${this.$route.params.id}`
            })

            fetch('https://api.entu.ee/auth', { headers: headers })
                .then(res => {
                    if (!res.ok) {
                        throw new TypeError(res.statusText)
                    } else {
                        return res.json()
                    }
                })
                .then(data => {
                    this.accounts = Object.values(data)

                    this.authenticating = false

                    if (this.accounts.length === 1) {
                        this.$router.push({ name: 'menu', params: { account: this.accounts[0].account } })
                    } else if (this.accounts.length > 0) {
                        sessionStorage.setItem('accounts', JSON.stringify(data))
                    } else {
                        this.accounts = null
                    }
                })
                .catch(err => {
                    this.authenticating = false
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
