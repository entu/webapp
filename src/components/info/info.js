export default {
  created () {
    this.setTitle()
    // if (this.accounts.length > 0) {
    //   this.$router.push({ name: 'auth' })
    // }
  },
  computed: {
    background () {
      return this.$root.$data.background
    }
  }
}
