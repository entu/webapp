export default {
  created () {
    this.setTitle()
  },
  computed: {
    background () {
      return this.$root.$data.background
    }
  }
}
