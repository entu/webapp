'use strict'

export default {
  metaInfo: {
    title: 'Entu · Futuristic data management',
    meta: [
      { name: 'description', content: 'Futuristic data management' }
    ]
  },
  created () {
    if (this.accounts.length > 0 && this.$route.path === '/') {
      this.$router.push({ name: 'auth' })
    }
    this.setTitle()
  }
}
