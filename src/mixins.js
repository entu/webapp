import axios from 'axios'
import _get from 'lodash/get'
import _set from 'lodash/set'

export default {
  data () {
    return {
      locales: ['et', 'en'],
      accounts: []
    }
  },
  created () {
    if (localStorage.getItem('accounts')) {
      this.accounts = JSON.parse(localStorage.getItem('accounts'))
    }
  },
  computed: {
    customHost () {
      if (!['entu.app', 'localhost'].includes(window.location.hostname)) {
        return window.location.hostname.replace('.entu.app', '')
      }
    },
    account () {
      if (['entu.app', 'localhost'].includes(window.location.hostname)) {
        return this.$route.params.account
      } else {
        return this.customHost
      }
    },
    token () {
      if (this.account && this.accounts.length > 0) {
        return this.accounts.filter(a => a.account === this.account)[0].token
      }
    },
    userId () {
      if (this.accounts.length > 0) {
        return this.accounts.filter(a => a.account === this.account)[0]._id
      }
    },
    selectableLocales () {
      return this.locales.filter(l => l !== this.locale)
    },
    locale () {
      return this.$i18n.locale
    },
    axios () {
      const a = axios.create({ baseURL: 'https://api.entu.app' })

      a.interceptors.request.use(config => {
        if (this.token) {
          _set(config, 'headers.Authorization', `Bearer ${this.token}`)
        } else if (this.account) {
          _set(config, 'params.account', this.account)
        }

        config.startTime = new Date()
        this.$root.$data.openRequests += 1
        return config
      })

      a.interceptors.response.use(response => {
        const endTime = new Date()
        console.log(`${endTime.getTime() - response.config.startTime.getTime()}ms - ${response.request.responseURL}`);

        this.$root.$data.openRequests -= 1

        return response
      }, (error) => {
        this.$root.$data.openRequests -= 1

        if (error.response.status === 401) {
          localStorage.clear()
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

        const endTime = new Date()
        console.log(`${endTime.getTime() - error.config.startTime.getTime()}ms - ${error.request.responseURL} (${error.response.status}) ${result}`);

        return Promise.reject(result)
      })

      return a
    },
    showMenu () {
      return this.$root.$data.menu
    }
  },
  methods: {
    setAccounts (accounts) {
      if (accounts && accounts.length > 0) {
        this.accounts = accounts
        localStorage.setItem('accounts', JSON.stringify(accounts))
      } else {
        this.accounts = []
        localStorage.removeItem('accounts')
      }
    },
    toggleMenu () {
      this.$root.$data.menu = !this.$root.$data.menu
    },
    setLocale (val) {
      localStorage.setItem('locale', val)
      this.$i18n.locale = val
      this.$router.go()
    },
    setTitle (title) {
      window.document.title = title ? `Entu · ${title}` : 'Entu'
    },
    getValue (valueList) {
      if (!valueList) { return }

      let values = []

      valueList.forEach(v => {
        if (!v.language || v.language === this.locale) {
          values.push(v.string)
        }
      })

      return values[0]
    },
    precisionRound (number, precision) {
      var factor = Math.pow(10, precision)
      return Math.round(number * factor) / factor
    },
    getReadableFileSize (fileSizeInBytes) {
      let i = -1
      const byteUnits = [' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']

      do {
        fileSizeInBytes = fileSizeInBytes / 1000
        i++
      } while (fileSizeInBytes > 1000)

      return this.precisionRound(fileSizeInBytes, 2).toLocaleString(this.locale) + byteUnits[i]
    }
  }
}
