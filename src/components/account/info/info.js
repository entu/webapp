import _get from 'lodash/get'

export default {
  name: 'accountInfo',
  data () {
    return {
      entities: 0,
      deletedEntities: 0,
      totalEntities: 0,

      entitiesStr: '',
      deletedEntitiesStr: '',

      entitiesStyle: '',

      properties: 0,
      deletedProperties: 0,
      totalproperties: 0,

      propertiesStr: '',
      deletedPropertiesStr: '',

      propertiesStyle: '',

      dbSize: 0,
      filesSize: 0,
      deletedFilesSize: 0,
      totalFilesSize: 0,

      dbSizeStr: '',
      filesSizeStr: '',
      deletedFilesSizeStr: '',

      dbSizeStyle: '',
      filesSizeStyle: '',
    }
  },
  created () {
    this.axios.get('/account').then((response) => {
      this.entities = _get(response, 'data.entities', 0)
      this.deletedEntities = _get(response, 'data.deletedEntities', 0)
      this.totalEntities = this.entities + this.deletedEntities

      this.entitiesStr = this.entities.toLocaleString(this.locale)
      this.deletedEntitiesStr = this.deletedEntities.toLocaleString(this.locale)

      this.entitiesStyle = `width: ${Math.round(this.entities * 100 / this.totalEntities)}%`

      this.properties = _get(response, 'data.properties', 0)
      this.deletedProperties = _get(response, 'data.deletedProperties', 0)
      this.totalProperties = this.properties + this.deletedProperties

      this.propertiesStr = this.properties.toLocaleString(this.locale)
      this.deletedPropertiesStr = this.deletedProperties.toLocaleString(this.locale)

      this.propertiesStyle = `width: ${Math.round(this.properties * 100 / this.totalProperties)}%`

      this.dbSize = _get(response, 'data.dbSize', 0)
      this.filesSize = _get(response, 'data.filesSize', 0)
      this.deletedFilesSize = _get(response, 'data.deletedFilesSize', 0)
      this.totalFilesSize = this.dbSize + this.filesSize + this.deletedFilesSize

      this.dbSizeStr = this.getReadableFileSize(this.dbSize)
      this.filesSizeStr = this.getReadableFileSize(this.filesSize)
      this.deletedFilesSizeStr = this.getReadableFileSize(this.deletedFilesSize)

      this.dbSizeStyle = `width: ${Math.round(this.dbSize * 100 / this.totalFilesSize)}%`
      this.filesSizeStyle = `width: ${Math.round(this.filesSize * 100 / this.totalFilesSize)}%`
    })
  },
  computed: {
    openRequests () {
      return this.$root.$data.openRequests
    }
  }
}
