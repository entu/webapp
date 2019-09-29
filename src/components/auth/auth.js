'use strict'

export default {
  name: 'Auth',
  data () {
    return {
      authenticating: false,
      authenticators: [
        {
          name: 'Apple',
          icon: 'icon-apple',
          click: this.authApple
        },
        {
          name: 'Google',
          icon: 'icon-google',
          click: this.authGoogle
        },
        {
          name: 'LHV Pank',
          icon: 'icon-bank',
          click: this.authLHV
        },
        {
          name: 'Mobiil-ID',
          icon: 'icon-mid',
          click: this.authMid
        }
      ]
    }
  },
  async created () {
    if (this.accounts.length > 0) {
      this.setTitle(this.$t('choose_db'))
    } else {
      this.setTitle(this.$t('signin'))
    }

    if (this.$route.params.id === 'exit') {
      this.logOut()
    } else if (this.$route.query.key) {
      this.authenticating = true

      try {
        const authResponse = await this.axios.get('/auth', {
          headers: {
            Authorization: `Bearer ${this.$route.query.key}`
          },
          params: {
            account: this.customHost
          }
        })

        this.setAccounts(authResponse.data)
        this.authenticating = false

        if (this.accounts.length === 1) {
          this.$router.push({ name: 'account', params: { account: this.accounts[0].account } })
        } else {
          this.$router.push({ name: 'auth' })
        }
      } catch (e) {
        this.setAccounts()
        this.authenticating = false
        this.$router.push({ name: 'auth' })
      }
    }
  },
  computed: {
    background () {
      return this.$root.$data.background
    }
  },
  methods: {
    authApple () {
      this.authenticating = true
      window.location = `https://api.entu.app/auth/apple?next=${window.location.origin}/auth/?key=`
    },
    authGoogle () {
      this.authenticating = true
      window.location = `https://api.entu.app/auth/google?next=${window.location.origin}/auth/?key=`
    },
    async authLHV () {
      this.authenticating = true

      const lhvResponse = await this.axios.get('/auth/lhv', {
        params: {
          next: window.location.origin + '/auth/?key='
        }
      })

      const url = lhvResponse.data.url
      const params = lhvResponse.data.signedRequest

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = url

      for (const key in params) {
        if (!params.hasOwnProperty(key)) { continue }

        const hiddenField = document.createElement('input')
        hiddenField.type = 'hidden'
        hiddenField.name = key
        hiddenField.value = params[key]

        form.appendChild(hiddenField)
      }

      document.body.appendChild(form)
      form.submit()
    },
    authMid () {

    },
    authIdc () {

    },
    logOut () {
      this.setAccounts()
      this.authenticating = false
      this.$router.push({ name: 'auth' })
    }
  }
}
