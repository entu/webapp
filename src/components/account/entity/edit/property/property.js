'use strict'

import _get from 'lodash/get'

export default {
  name: 'EntityProperty',
  props: [
    'property'
  ],
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
      if (_get(this, 'property.formula')) { return }

      if (_get(this, 'property.classifier', []).length) { return }
      if (_get(this, 'property.values', []).find(x => x.formula)) { return }

      return true
    },
    values () {
      const values = this.property.values.filter(v => !v.deleted && (!v.language || v.language === this.locale)).map(v => {
        if (v.formula) {
          return {
            _id: v._id,
            control: 'formula',
            string: v.string
          }
        }
        switch (v.type) {
          case 'date':
            return {
              _id: v._id,
              control: 'input',
              string: (new Date(v.date.substr(0, 10))).toLocaleDateString(this.locale)
            }
            break
          case 'datetime':
            return {
              _id: v._id,
              control: 'input',
              string: (new Date(v.datetime)).toLocaleString(this.locale)
            }
            break
          case 'integer':
            return {
              _id: v._id,
              control: 'input',
              string: v.integer.toLocaleString(this.locale, { minimumFractionDigits: 0 })
            }
            break
          case 'decimal':
            return {
              _id: v._id,
              control: 'input',
              string: v.decimal.toLocaleString(this.locale, { minimumFractionDigits: 2 })
            }
            break
          case 'reference':
            return {
              _id: v._id,
              control: 'reference',
              string: v.string || v.reference,
              to: {
                name: 'entity',
                params: {
                  entity: v.reference
                },
                query: this.$route.query
              }
            }
            break
          case 'atby':
            return {
              _id: v._id,
              control: 'atby',
              string: v.string || v.reference,
              to: {
                name: 'entity',
                params: {
                  entity: v.reference
                },
                query: this.$route.query
              },
              info: (new Date(v.datetime)).toLocaleString(this.locale)
            }
            break
          case 'file':
            return {
              _id: v._id,
              control: 'file',
              string: v.filename,
              to: {
                name: 'file',
                params: {
                  account: this.account,
                  id: v._id
                }
              },
              target: '_blank',
              info: this.getReadableFileSize(v.size)
            }
            break
          case 'boolean':
            return {
              _id: v._id,
              control: 'boolean',
              string: v.boolean ? this.$t('true') : this.$t('false'),
              boolean: v.boolean
            }
            break
          case 'string':
            return {
              _id: v._id,
              control: 'input',
              string: v.string
            }
            break
          case 'text':
            return {
              _id: v._id,
              control: 'text',
              string: v.string
            }
            break
          default:
            return v
            break
        }
      })

      if (!this.property.list && values.length > 0) { return values }

      if (this.property.type === 'boolean') {
        values.push({
          control: 'boolean',
          boolean: false
        })
      } else if (['date', 'datetime', 'integer', 'decimal', 'string'].includes(this.property.type)) {
        values.push({
          control: 'input',
          string : ''
        })
      } else if (this.property.type === 'text') {
        values.push({
          control: 'text',
          string : ''
        })
      }

      return values
    }
  },
  methods: {
    async save (value, newValue) {
      if (value.string === newValue) { return }

      const idx = this.property.values.findIndex(x => x._id === value._id)
      const newProperty = {
        type: this.property.name
      }

      if (value._id) {
        const deleteResponse = await this.axios.delete(`/property/${value._id}`)
      }

      if (value._id && newValue === '') {
        this.property.values[idx]._id = null
        this.property.values[idx].string = ''
      }

      switch (this.property.type) {
        case 'integer':
          newValue = newValue.replace(/\s/g, '')
          newValue = parseInt(newValue, 10)
          if (!newValue && newValue !== 0) { return }
          newProperty.integer = newValue
          break
        case 'decimal':
          newValue = newValue.replace(/\s/g, '').replace(',', '.')
          newValue = parseFloat(newValue)
          if (!newValue && newValue !== 0) { return }
          newProperty.decimal = newValue
          break
        case 'boolean':
          newProperty.boolean = newValue
          break
        case 'string':
          newValue = newValue.trim()
          if (newValue === '') { return }
          newProperty.string = newValue
          break
        case 'text':
          newValue = newValue.trim()
          if (newValue === '') { return }
          newProperty.string = newValue
          break
        default:
          return
      }

      if (this.entityId) {
        var addResponse = await this.axios.post(`/entity/${this.entityId}`, [newProperty])
      } else {
        let newProperties = [
          { type: '_parent', reference: this.parentId },
          { type: '_type', reference: this.typeId }
        ]
        newProperties.push(newProperty)

        var addResponse = await this.axios.post('/entity', newProperties)
        this.setNewEntityId(addResponse._id)
      }

      const newId = _get(addResponse, 'properties.0._id')

      if (idx > -1) {
        this.property.values[idx]._id = newId
      } else {
        this.property.values.push({
          _id: newId,
          control: 'input'
        })
      }

      const updatedIdx = this.property.values.findIndex(x => x._id === newId)
      switch (this.property.type) {
        case 'integer':
          this.property.values[updatedIdx].string = newValue.toLocaleString(this.locale, { minimumFractionDigits: 0 })
          this.property.values[updatedIdx].integer = newValue
          break
        case 'decimal':
          this.property.values[updatedIdx].string = newValue.toLocaleString(this.locale, { minimumFractionDigits: 2 })
          this.property.values[updatedIdx].decimal = newValue
          break
        case 'boolean':
          this.property.values[updatedIdx].string = newValue ? this.$t('true') : this.$t('false')
          this.property.values[updatedIdx].boolean = newValue
          break
        case 'string':
          this.property.values[updatedIdx].string = newValue
          break
        case 'text':
          this.property.values[updatedIdx].string = newValue
          this.property.values[updatedIdx].control = 'text'
          break
      }
    },
    change () {
      if (!this.property.list) { return }
      if (this.property.values.filter(x => !x._id).length > 0) { return }

      if (['date', 'datetime', 'integer', 'decimal', 'string'].includes(this.property.type)) {
        this.property.values.push({
          control: 'input',
          string : ''
        })
      } else if (this.property.type === 'text') {
        this.property.values.push({
          control: 'text',
          string : ''
        })
      }
    },
    resizeText (e) {
      const offset = e.target.offsetHeight - e.target.clientHeight

      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + offset * 2 + 'px'

      e.target.setAttribute('rows', '3');
    }
  }
}
