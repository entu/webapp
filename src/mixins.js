import axios from 'axios'
import _get from 'lodash/get'

export default {
  data () {
    return {
      locales: ['et', 'en']
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
      return _get(this, ['allAccounts', this.account, '_id'])
    },
    selectableLocales () {
      return this.locales.filter((l) => l !== this.locale)
    },
    locale () {
      return this.$i18n.locale
    },
    axios () {
      const token = _get(this, ['allAccounts', this.account, 'token'])
      const a = axios.create({ baseURL: 'https://api.entu.app' })

      if (token) {
        a.defaults.headers = { Authorization: `Bearer ${token}` }
      } else if (this.account) {
        a.defaults.params = { account: this.account }
      }

      a.interceptors.request.use((config) => {
        this.$root.$data.openRequests += 1
        return config
      })

      a.interceptors.response.use((response) => {
        this.$root.$data.openRequests -= 1
        return response
      }, (error) => {
        this.$root.$data.openRequests -= 1

        if (error.response.status === 401) {
          sessionStorage.clear()
          location.reload()
        }

        let result
        if (_get(error, 'response.data.message')) {
          result = error.response.data.message
        } else if (_get(error, 'response.data')) {
          result = error.response.data
        } else if (_get(error, 'response')) {
          result = error.response
        }

        console.error(result)

        return Promise.reject(result)
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
