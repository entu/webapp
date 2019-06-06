export default {
  name: 'Auth',
  data () {
    return {
      host: window.location.origin,
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
          url: `https://api.entu.app/auth/lhv?next=${window.location.origin}/auth/`,
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
      ],
      accounts: null,
    }
  },
  created () {
    if (this.$route.params.id === 'out') {
      this.logOut()
    } else if (this.$route.params.id) {
      this.authenticating = true

      this.axios.get('/auth', { headers: { Authorization: `Bearer ${this.$route.params.id}` } })
        .then(response => {
          this.authenticating = false

          this.accounts = Object.values(response.data)
          if (this.accounts.length === 1) {
            this.$router.push({ name: 'menu', params: { account: this.accounts[0].account } })
          } else if (this.accounts.length > 0) {
            sessionStorage.setItem('accounts', JSON.stringify(response.data))
          } else {
            this.accounts = null
          }

          this.$router.push({ name: 'auth' })
        })
        .catch(() => {
          this.authenticating = false
          this.$router.push({ name: 'auth' })
        })
    }

    const accounts = JSON.parse(sessionStorage.getItem('accounts'))
    if (!this.accounts && accounts) {
      this.setTitle(this.$t('choose_db'))

      this.accounts = Object.values(accounts)
    } else {
      this.setTitle(this.$t('login'))
    }
  },
  computed: {
    background () {
      return this.$root.$data.background
    }
  },
  methods: {
    logOut () {
      this.accounts = null
      this.authenticating = false
      sessionStorage.removeItem('accounts')
      this.$router.push({ name: 'info' })
    }
  }
}
