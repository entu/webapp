export default {
    computed: {
        authenticated () {
            const account = this.$route.params.account
            const accounts = JSON.parse(sessionStorage.getItem('accounts'))
            return accounts && accounts[account] && accounts[account].token
        },
        locales () {
            return ['et', 'en']
        },
        selectableLocales () {
            return this.locales.filter(l => l !== this.locale)
        },
        locale () {
            return this.$i18n.locale
        }
    },
    methods: {
        setLocale (val) {
            localStorage.setItem('locale', val)
            this.$i18n.locale = val
            this.$router.go()
        }
    }
}
