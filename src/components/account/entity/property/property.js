'use strict'

import _get from 'lodash/get'

export default {
  name: 'EntityProperty',
  props: [
    'entity',
    'property',
    'edit'
  ],
  computed: {
    visible () {
      if (this.property.key.startsWith('_')) { return }
      if (!this.edit && this.property.key === 'name') { return }
      if (!this.edit && this.values.length === 0) { return }
      if (this.property.formula) { return }

      return true
    },
    values () {
      const values = this.property.values.filter(v => !v.deleted && (!v.language || v.language === this.locale)).map(v => {
        if (v.formula) {
          return {
            _id: v._id,
            string: v.formula
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
              string: v.boolean ? this.$t('true') : this.$t('false')
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

      if (!this.edit) { return values }
      if (!this.property.list && values.length > 0) { return values }

      if (['date', 'datetime', 'integer', 'decimal', 'string', 'text'].includes(this.property.type)) {
        values.push({
          control: 'input',
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
        type: this.property.key
      }

      if (value._id) {
        const deleteResponse = await this.axios.delete(`/property/${value._id}`)
      }

      if (value._id && newValue === '') {
        this.property.values[idx]._id = null
        this.property.values[idx].string = ''
      }

      switch (this.property.type) {
        case 'string':
          newValue = newValue.trim()
          if (newValue === '') { return }
          newProperty.string = newValue.trim()
          break
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
        default:
          return
      }

      const addResponse = await this.axios.post(`/entity/${this.entity._id}`, [newProperty])
      const newId = _get(addResponse, 'data.properties.0._id')

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
        case 'string':
          this.property.values[updatedIdx].string = newValue
          break
        case 'integer':
          this.property.values[updatedIdx].string = newValue.toLocaleString(this.locale, { minimumFractionDigits: 0 })
          this.property.values[updatedIdx].integer = newValue
          break
        case 'decimal':
          this.property.values[updatedIdx].string = newValue.toLocaleString(this.locale, { minimumFractionDigits: 2 })
          this.property.values[updatedIdx].decimal = newValue
          break
      }
    },
    change () {
      if (!this.edit) { return }
      if (!this.property.list) { return }
      if (this.property.values.filter(x => !x._id).length > 0) { return }

      this.property.values.push({
        control: 'input',
        string : ''
      })
    }
  }
}
