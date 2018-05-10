import axios from 'axios'

export default {
  data () {
    return {
      locales: ['et', 'en'],
    }
  },
  computed: {
    allAccounts () {
      return JSON.parse(sessionStorage.getItem('accounts'))
    },
    account () {
      return this.$route.params.account
    },
    userId () {
      return this.allAccounts && this.allAccounts[this.account] && this.allAccounts[this.account]._id
    },
    selectableLocales () {
      return this.locales.filter(l => l !== this.locale)
    },
    locale () {
      return this.$i18n.locale
    },
    axios () {
      const token = this.allAccounts && this.allAccounts[this.account] && this.allAccounts[this.account].token

      return axios.create({
        baseURL: 'https://api.entu.app',
        headers: token ? { Authorization: `Bearer ${token}` } : null,
        params: { account: this.account }
      })
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
