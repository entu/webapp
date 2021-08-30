'use strict'

import axios from 'axios'
import _get from 'lodash/get'
import _set from 'lodash/set'
import { mapGetters, mapMutations } from 'vuex'

export default {
  data () {
    return {
      accounts: []
    }
  },
  created () {
    if (localStorage.getItem('accounts')) {
      this.accounts = JSON.parse(localStorage.getItem('accounts'))
    }
  },
  computed: {
    ...mapGetters([
      'locales',
      'locale',
      'background',
      'showMenu',
      'showList',
      'showEntity',
      'showEdit',
      'activeRequests',
      'activeUploads',
      'activeMenu',
      'newEntityId'
    ]),
    customHost () {
      if (!['www.entu.ee', 'entu.app', 'localhost'].includes(window.location.hostname)) {
        return window.location.hostname.replace('.entu.app', '')
      }
    },
    account () {
      if (['www.entu.ee', 'entu.app', 'localhost'].includes(window.location.hostname)) {
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
    axios () {
      const a = axios.create({ baseURL: 'https://api.entu.app' })

      a.interceptors.request.use(config => {
        if (this.token) {
          _set(config, 'headers.Authorization', `Bearer ${this.token}`)
        } else if (this.account) {
          _set(config, 'params.account', this.account)
        }

        config.startTime = new Date()
        this.$store.commit('setActiveRequests', 1)
        return config
      })

      a.interceptors.response.use(response => {
        const method = response.config.method.toUpperCase()
        const endTime = new Date()
        const s = (endTime.getTime() - response.config.startTime.getTime()) / 1000

        let color = 'black'
        switch (method) {
          case 'GET':
            color = 'green'
            break
          case 'POST':
            color = 'orange'
            break
          case 'PUT':
            color = 'gold'
            break
          case 'DELETE':
            color = 'red'
            break
          default:
            color = 'black'
            break
        }

        console.log(`%c${method} %c ${s.toFixed(3)} %c${response.request.responseURL}`, `font-weight:bold;color:${color}`, 'font-family:monospace', 'font-weight:regular')

        this.$store.commit('setActiveRequests', -1)

        return response.data
      }, error => {
        const method = error.response.config.method.toUpperCase()
        const endTime = new Date()
        const s = (endTime.getTime() - error.response.config.startTime.getTime()) / 1000

        let color = 'black'
        switch (method) {
          case 'GET':
            color = 'green'
            break
          case 'POST':
            color = 'orange'
            break
          case 'PUT':
            color = 'gold'
            break
          case 'DELETE':
            color = 'red'
            break
          default:
            color = 'black'
            break
        }

        let result
        if (_get(error, 'response.data.message')) {
          result = error.response.data.message
        } else if (_get(error, 'response.data')) {
          result = error.response.data
        } else if (_get(error, 'response')) {
          result = error.response
        }

        console.log(`%c${method}%c ${s.toFixed(3)} %c${error.request.responseURL} - %cERROR ${error.response.status} ${result}`, `font-weight:bold;color:${color}`, 'font-family:monospace;font-weight:regular;color:black', 'font-weight:regular', 'color:red')

        if (error.response.status === 401) {
          // localStorage.clear()
          // location.reload()
        }

        this.$store.commit('setActiveRequests', -1)

        return Promise.reject(result)
      })

      return a
    },
    hasQuery () {
      return Object.keys(this.$route.query).length > 0
    },
  },
  methods: {
    ...mapMutations([
      'toggleMenu',
      'toggleList',
      'toggleEdit',
      'setActiveMenu',
      'setNewEntityId'
    ]),
    setAccounts (accounts) {
      if (accounts && accounts.length > 0) {
        this.accounts = accounts
        localStorage.setItem('accounts', JSON.stringify(accounts))
      } else {
        this.accounts = []
        localStorage.removeItem('accounts')
      }
    },
    setLocale (locale) {
      this.$store.commit('setLocale', locale)
      this.$i18n.locale = locale
      // this.$router.go()
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
