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
      return this.add ? this.$t('addTitle', { type: this.name.toLowerCase() }) : this.$t('editTitle', { name: this.name })
    }
  }
}
