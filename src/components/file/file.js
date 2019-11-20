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

    const fileResponse = await this.axios.get(`/property/${this.$route.params.id}`)

    if (fileResponse.url) {
      window.location.replace(fileResponse.url)
    }
  }
}
