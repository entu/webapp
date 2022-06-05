'use strict'

export default {
  name: 'Auth',
  data () {
    return {
      apiUrl: process.env.VUE_APP_API_URL,
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
          name: 'Microsoft',
          icon: 'icon-microsoft',
          click: this.authMicrosoft
        },
        {
          name: 'LHV Pank',
          icon: 'icon-bank',
          click: this.authLHV
        },
        // {
        //   name: 'Mobiil-ID',
        //   icon: 'icon-mid',
        //   click: this.authMid
        // }
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

        this.setAccounts(authResponse)
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
  methods: {
    authApple () {
      this.authenticating = true
      window.location = `${this.apiUrl}/auth/apple?next=${window.location.origin}/auth/?key=`
    },
    authGoogle () {
      this.authenticating = true
      window.location = `${this.apiUrl}/auth/google?next=${window.location.origin}/auth/?key=`
    },
    authMicrosoft () {
      this.authenticating = true
      window.location = `${this.apiUrl}/auth/microsoft?next=${window.location.origin}/auth/?key=`
    },
    async authLHV () {
      this.authenticating = true

      const { url, signedRequest } = await this.axios.get('/auth/lhv', {
        params: {
          next: window.location.origin + '/auth/?key='
        }
      })

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = url

      for (const key in signedRequest) {
        if (!signedRequest.hasOwnProperty(key)) { continue }

        const hiddenField = document.createElement('input')
        hiddenField.type = 'hidden'
        hiddenField.name = key
        hiddenField.value = signedRequest[key]

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
    }
  }
}
