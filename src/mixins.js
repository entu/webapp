import axios from 'axios'
const _get = require('lodash/get')

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
      return this.locales.filter((l) => l !== this.locale)
    },
    locale () {
      return this.$i18n.locale
    },
    axios () {
      const token = this.allAccounts && this.allAccounts[this.account] && this.allAccounts[this.account].token
      const a = axios.create({ baseURL: 'https://api.entu.app' })

      if (token) {
        a.defaults.headers = { Authorization: `Bearer ${token}` }
      } else if (this.account) {
        a.defaults.params = { account: this.account }
      }

      a.interceptors.response.use(function (response) {
        console.log(response.request.responseURL)

        return response
      }, function (error) {
        if (_get(error, 'response.data.message')) {
          console.error(error.response.data.message)
        } else if (_get(error, 'response.data')) {
          console.error(error.response.data)
        } else if (_get(error, 'response')) {
          console.error(error.response)
        }

        if (error.response.status === 401) {
          sessionStorage.clear()
          location.reload()
        }

        return error
      })

      return a
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
