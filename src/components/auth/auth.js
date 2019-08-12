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
        },
        {
          name: this.$t('id_card'),
          icon: 'icon-idc',
          click: this.authIdc
        },
      ]
    }
  },
  created () {
    if (this.accounts.length > 0) {
      this.setTitle(this.$t('choose_db'))
    } else {
      this.setTitle(this.$t('login'))

      let appleIDAuthScript = document.createElement('script')
      appleIDAuthScript.setAttribute('src', 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js')
      document.body.appendChild(appleIDAuthScript)
    }

    if (this.$route.params.id === 'exit') {
      this.logOut()
    } else if (this.$route.params.id) {
      this.authenticating = true

      this.axios.get('/auth', { headers: { Authorization: `Bearer ${this.$route.params.id}` }, params: { account: this.customHost } })
        .then(response => {
          this.setAccounts(response.data)
          this.authenticating = false

          if (this.accounts.length === 1) {
            this.$router.push({ name: 'account', params: { account: this.accounts[0].account } })
          } else {
            this.$router.push({ name: 'auth' })
          }
        })
        .catch(() => {
          this.setAccounts()
          this.authenticating = false
          this.$router.push({ name: 'auth' })
        })
    }
  },
  computed: {
    background () {
      return this.$root.$data.background
    }
  },
  methods: {
    authApple () {
      AppleID.auth.init({
        clientId : this.$root.$data.appleIDAuthClientId,
        scope : 'name email',
        redirectURI: `https://api.entu.app/auth/apple?next=${window.location.origin}/auth/`
      })
      AppleID.auth.signIn()
    },
    authGoogle () {
      this.authenticating = true
      window.location = `https://api.entu.app/auth/google?next=${window.location.origin}/auth/`
    },
    authLHV () {
      this.authenticating = true

      this.axios.get('/auth/lhv', { params: { next: window.location.origin + '/auth/' } })
        .then(response => {
          const url = response.data.url
          const params = response.data.signedRequest

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
        })
        .catch(() => {
          this.authenticating = false
        })
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
