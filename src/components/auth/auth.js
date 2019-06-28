export default {
  name: 'Auth',
  data () {
    return {
      authenticating: false,
      authenticators: [
        {
          name: 'Apple',
          url: `https://api.entu.app/auth/apple?next=${window.location.origin}/auth/`,
          icon: 'icon-apple'
        },
        {
          name: 'Google',
          url: `https://api.entu.app/auth/google?next=${window.location.origin}/auth/`,
          icon: 'icon-google'
        },
        {
          name: 'LHV Pank',
          url: '#',
          click: this.authLHV,
          icon: 'icon-bank'
        },
        {
          name: 'Mobiil-ID',
          url: `https://api.entu.app/auth/mid?next=${window.location.origin}/auth/`,
          icon: 'icon-mid'
        },
        {
          name: this.$t('id_card'),
          url: `https://api.entu.app/auth/idc?next=${window.location.origin}/auth/`,
          icon: 'icon-idc'
        },
      ]
    }
  },
  created () {
    if (this.accounts.length > 0) {
      this.setTitle(this.$t('choose_db'))
    } else {
      this.setTitle(this.$t('login'))
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
    logOut () {
      this.setAccounts()
      this.authenticating = false
      this.$router.push({ name: 'auth' })
    }
  }
}
