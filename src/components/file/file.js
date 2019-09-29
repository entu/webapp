'use strict'

export default {
  name: 'File',
  data () {
    return {
      error: ''
    }
  },
  created () {
    if (!this.account) { return }
    if (!this.$route.params.id) { return }

    this.axios.get(`/property/${this.$route.params.id}`)
      .then(response => {
        if (response.data.url) {
          window.location.replace(response.data.url)
        }
      })
      .catch(err => {
        this.error = err
      })
  }
}
