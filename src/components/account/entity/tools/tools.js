'use strict'

export default {
  name: 'EntityTools',
  computed: {
    openRequests () {
      return this.$root.$data.openRequests
    },
    entity () {
      return this.$parent.$data.entity
    }
  }
}
