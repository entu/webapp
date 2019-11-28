'use strict'

export default {
  name: 'EntityTools',
  props: [
    'add',
    'name',
    'closeTo'
  ],
  computed: {
    title () {
      console.log(this.name);
      return this.add ? this.$t('addTitle', { type: this.name }) : this.$t('editTitle', { name: this.name })
    }
  }
}
