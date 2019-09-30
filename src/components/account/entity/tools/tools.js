'use strict'

export default {
  name: 'EntityTools',
  computed: {
    openRequests () {
      return this.$root.$data.openRequests
    },
    entity () {
      return this.$parent.$data.entity
    },
    editMode () {
      return this.$parent.$data.editMode
    }
  },
  methods: {
    toggleEdit () {
      this.$parent.$data.editMode = !this.$parent.$data.editMode
    }
  }
}
