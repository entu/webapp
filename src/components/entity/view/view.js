import entityList from './list/list.vue'
import entityTools from './tools/tools.vue'

export default {
  name: 'EntityContent',
  components: {
    'entity-list': entityList,
    'entity-tools': entityTools
  },
  computed: {
    id () {
      return this.$route.params.entity
    }
  }
}
