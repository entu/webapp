import { get } from 'axios'

export default {
  name: 'Auth',
  data () {
    return {
      host: window.location.origin,
      authenticating: false,
      accounts: null
    }
  },
  created () {
    if (this.$route.params.id === 'out') {
      this.logOut()
    } else if (this.$route.params.id) {
      this.authenticating = true

      const options = {
        headers: {
          Authorization: `Bearer ${this.$route.params.id}`
        }
      }

      get('https://api.entu.app/auth', options)
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
        })
        .catch(err => {
          console.error(err)
          this.authenticating = false
          this.$router.push({ name: 'auth' })
        })
    }

    const accounts = JSON.parse(sessionStorage.getItem('accounts'))
    if (!this.accounts && accounts) {
      this.accounts = Object.values(accounts)
    }
  },
  computed: {
    background () {
      return 'bg-' + Math.ceil(Math.random() * 12)
    }
  },
  methods: {
    logOut () {
      this.accounts = null
      this.authenticating = false
      sessionStorage.removeItem('accounts')
    }
  }
}
