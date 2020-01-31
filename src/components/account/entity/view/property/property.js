'use strict'

import _get from 'lodash/get'

export default {
  name: 'EntityProperty',
  props: [
    'property'
  ],
  computed: {
    visible () {
      if (this.property.name.startsWith('_')) { return }
      if (this.property.name === 'name') { return }
      if (this.values.length === 0) { return }

      return true
    },
    values () {
      const values = this.property.values.filter(v => !v.deleted && (!v.language || v.language === this.locale)).map(v => {
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
              info: this.getReadableFileSize(v.filesize)
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

      return values
    }
  }
}
