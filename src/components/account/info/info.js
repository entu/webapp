'use strict'

import _get from 'lodash/get'

export default {
  data () {
    return {
      dbSize: 0,
      dbSizeStr: '',
      dbSizeStyle: '',
      deletedEntities: 0,
      deletedEntitiesStr: '',
      deletedFilesSize: 0,
      deletedFilesSizeStr: '',
      deletedProperties: 0,
      deletedPropertiesStr: '',
      entities: 0,
      entitiesStr: '',
      entitiesStyle: '',
      filesSize: 0,
      filesSizeStr: '',
      filesSizeStyle: '',
      properties: 0,
      propertiesStr: '',
      propertiesStyle: '',
      totalFilesSizeStr: 0,
      showStats: false
    }
  },
  created () {
    this.setTitle(this.$t('title'))

    this.axios.get('/account').then(response => {
      this.entities = _get(response, 'data.entities', 0)
      this.deletedEntities = _get(response, 'data.deletedEntities', 0)

      this.entitiesStr = this.entities.toLocaleString(this.locale)
      this.deletedEntitiesStr = this.deletedEntities.toLocaleString(this.locale)
      this.entitiesStyle = `width: ${Math.round(this.entities * 100 / (this.entities + this.deletedEntities))}%`

      this.properties = _get(response, 'data.properties', 0)
      this.deletedProperties = _get(response, 'data.deletedProperties', 0)

      this.propertiesStr = this.properties.toLocaleString(this.locale)
      this.deletedPropertiesStr = this.deletedProperties.toLocaleString(this.locale)
      this.propertiesStyle = `width: ${Math.round(this.properties * 100 / (this.properties + this.deletedProperties))}%`

      this.filesSize = _get(response, 'data.filesSize', 0)
      this.deletedFilesSize = _get(response, 'data.deletedFilesSize', 0)

      this.filesSizeStr = this.getReadableFileSize(this.filesSize)
      this.deletedFilesSizeStr = this.getReadableFileSize(this.deletedFilesSize)
      this.filesSizeStyle = `width: ${Math.round(this.filesSize * 100 / (this.filesSize + this.deletedFilesSize))}%`

      this.dbSize = _get(response, 'data.dbSize', 0)
      this.dbSizeStr = this.getReadableFileSize(this.dbSize)
      this.dbSizeStyle = `width: ${Math.round(this.dbSize * 100 / (this.dbSize + this.filesSize + this.deletedFilesSize))}%`

      this.totalFilesSizeStr = this.getReadableFileSize(this.dbSize + this.filesSize + this.deletedFilesSize)

      this.showStats = true
    })
  },
  computed: {
    openRequests () {
      return this.$root.$data.openRequests
    }
  }
}
