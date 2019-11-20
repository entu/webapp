'use strict'

export default {
  name: 'File',
  data () {
    return {
      error: ''
    }
  },
  async created () {
    if (!this.account) { return }
    if (!this.$route.params.id) { return }

    const { url } = await this.axios.get(`/property/${this.$route.params.id}`)

    if (url) {
      window.location.replace(url)
    }
  }
}
