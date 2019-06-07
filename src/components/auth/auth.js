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
      ]
    }
  },
  created () {
    if (this.accounts.length > 0) {
      this.setTitle(this.$t('choose_db'))
    } else if (this.accounts.length === 1) {
      this.$router.push({ name: 'menu', params: { account: this.accounts[0].account } })
    } else {
      this.setTitle(this.$t('login'))
    }

    if (this.$route.params.id === 'out') {
      this.logOut()
    } else if (this.$route.params.id) {
      this.authenticating = true

      this.axios.get('/auth', { headers: { Authorization: `Bearer ${this.$route.params.id}` }, params: { account: self.customHost } })
        .then(response => {
          this.setAccounts(response.data)
          this.authenticating = false
          this.$router.push({ name: 'auth' })
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
    logOut () {
      this.setAccounts()
      this.authenticating = false
      this.$router.push({ name: 'auth' })
    }
  }
}
