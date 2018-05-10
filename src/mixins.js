export default {
  data () {
    return {
      locales: ['et', 'en']
    }
  },
  computed: {
    account () {
      return this.$route.params.account
    },
    token () {
      const accounts = JSON.parse(sessionStorage.getItem('accounts'))
      return accounts && accounts[this.account] && accounts[this.account].token
    },
    userId () {
      const accounts = JSON.parse(sessionStorage.getItem('accounts'))
      return accounts && accounts[this.account] && accounts[this.account]._id
    },
    authHeader () {
      if (this.token) {
        return { Authorization: `Bearer ${this.token}` }
      }
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
    },
    getValue (valueList) {
      if (!valueList) { return }

      let values = []

      valueList.forEach((v) => {
        if (!v.language || v.language === this.locale) {
          values.push(v.string)
        }
      })

      return values[0]
    }
  }
}
