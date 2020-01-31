'use strict'

import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'
import axios from 'axios'

export default {
  name: 'EntityProperty',
  props: [
    'property'
  ],
  data () {
    return {
      uploadProgress: {}
    }
  },
  created () {
    this.addEmptyValue()
  },
  computed: {
    add () {
      return this.$route.name === 'add'
    },
    entityId () {
      return this.add ? this.newEntityId : this.$route.params.entity
    },
    parentId () {
      return this.$route.params.parent
    },
    typeId () {
      return this.$route.params.type
    },
    visible () {
      if (_get(this, 'property.name').startsWith('_')) { return }
      if (_get(this, 'property.classifier', []).length) { return }
      if (_get(this, 'property.formula')) { return }
      if (_get(this, 'property.readonly')) { return }

      return true
    },
    isReadOnly () {
      return this.property.readonly
    },
    isInput () {
      return !this.isReadOnly && !this.isSet && ['date', 'datetime', 'integer', 'decimal', 'string'].includes(this.property.type)
    },
    isText () {
      return !this.isReadOnly && !this.isSet && this.property.type === 'text'
    },
    isSet () {
      return !this.isReadOnly && this.property.set && this.property.set.length > 0
    },
    isFormula () {
      return this.property.formula
    },
    isReference () {
      return !this.isReadOnly && !this.isSet && this.property.type === 'reference'
    },
    isBoolean () {
      return !this.isReadOnly && !this.isSet && this.property.type === 'boolean'
    },
    isFile () {
      return !this.isReadOnly && !this.isSet && this.property.type === 'file'
    }
  },
  methods: {
    async save (value, newValue, valueIndex) {
      if (value.string === newValue) { return }
      if (this.isFile && value._id && newValue === '' && !confirm(this.$t('fileDeleteConfirmation', { filename: value.filename }))) { return }

      value.string = newValue

      let newProperties = []

      if (value._id) {
        const deleteResponse = await this.axios.delete(`/property/${value._id}`)
      }

      if (value._id && newValue === '') {
        if (this.isFile) {
          this.property.values.splice(valueIndex, 1)
        } else {
          this.property.values.splice(valueIndex, 1, {})
        }
        return
      }

      switch (this.property.type) {
        case 'integer':
          newValue = newValue.replace(/\s/g, '')
          newValue = parseInt(newValue, 10)
          if (!newValue && newValue !== 0) { return }

          newProperties.push({
            type: this.property.name,
            integer: newValue
          })
          break
        case 'decimal':
          newValue = newValue.replace(/\s/g, '').replace(',', '.')
          newValue = parseFloat(newValue)
          if (!newValue && newValue !== 0) { return }

          newProperties.push({
            type: this.property.name,
            decimal: newValue
          })
          break
        case 'boolean':
          newProperties.push({
            type: this.property.name,
            boolean: newValue
          })
          break
        case 'string':
          newValue = newValue.trim()
          if (newValue === '') { return }

          newProperties.push({
            type: this.property.name,
            string: newValue
          })
          break
        case 'text':
          newValue = newValue.trim()
          if (newValue === '') { return }

          newProperties.push({
            type: this.property.name,
            string: newValue
          })
          break
        case 'file':
          if (newValue.length === 0) { return }

          for (var i = 0; i < newValue.length; i++) {
            newProperties.push({
              type: this.property.name,
              filename: newValue[i].name,
              filesize: newValue[i].size,
              filetype: newValue[i].type
            })
          }
          break
        default:
          return
      }

      if (this.entityId) {
        var addResponse = await this.axios.post(`/entity/${this.entityId}`, newProperties)
      } else {
        newProperties.push({
          type: '_parent',
          reference: this.parentId
        })
        newProperties.push({
          type: '_type',
          reference: this.typeId
        })

        var addResponse = await this.axios.post('/entity', newProperties)
        this.setNewEntityId(addResponse._id)
      }

      const addedProperties = _get(addResponse, 'properties', [])

      for (var i = 0; i < addedProperties.length; i++) {
        const property = addedProperties[i]

        if (property.type === '_type') { continue }
        if (property.type === '_parent') { continue }

        if (property.upload) {
          const file = [...newValue].find(x => x.name === property.filename)
          const config = {
            headers: property.upload.headers,
            onUploadProgress: function (progressEvent) {
              property.percent = (progressEvent.loaded / progressEvent.total).toLocaleString(this.locale, { style: 'percent', minimumFractionDigits: 2 })
              this.$forceUpdate()
            }.bind(this)
          }

          axios.put(property.upload.url, file, config)
            .then(response => {
              delete property.percent
            })
            .catch(error => {
              property.percent = error.toString()
            })
            .then(() => {
              this.$forceUpdate()
            })
        }

        delete property.upload
        delete property.type

        this.property.values.splice(valueIndex + i, 1, property)
        this.$forceUpdate()

        this.addEmptyValue()
      }
    },
    change () {
      // this.addEmptyValue()
    },
    addEmptyValue () {
      if (!this.property.list && this.property.values.length > 0) { return }
      if (_isEqual(this.property.values[this.property.values.length - 1], {})) { return }

      this.property.values.push({})
    },
    resizeText (e) {
      const offset = e.target.offsetHeight - e.target.clientHeight

      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + offset * 2 + 'px'

      e.target.setAttribute('rows', '3');
    }
  }
}
