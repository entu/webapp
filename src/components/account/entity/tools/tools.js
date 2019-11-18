'use strict'

export default {
  name: 'EntityTools',
  props: [
    'entity',
    'name',
    'edit',
    'right'
  ],
  methods: {
    toggleEdit () {
      this.$parent.$data.edit = !this.$parent.$data.edit
    }
  }
}
