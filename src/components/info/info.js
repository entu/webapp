'use strict'

export default {
  created () {
    if (this.accounts.length > 0 && this.$route.path === '/') {
      this.$router.push({ name: 'auth' })
    }
    this.setTitle()
  }
}
