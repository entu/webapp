'use strict'

export default {
  name: 'EntityTools',
  props: [
    'entity',
    'name',
    'edit',
    'right'
  ],
  computed: {
    openRequests () {
      return this.$root.$data.openRequests
    }
  },
  methods: {
    toggleEdit () {
      this.$parent.$data.edit = !this.$parent.$data.edit
    }
  }
}
