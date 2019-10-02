'use strict'

export default {
  name: 'EntityProperty',
  props: [
    'property',
    'edit'
  ],
  computed: {
    values () {
      if (!this.property.values && this.edit) { return [{ string : '' }] }
      if (!this.property.values) { return }

      return this.property.values.filter(v => !v.language || v.language === this.locale).map(v => {
        switch (this.property.type) {
          case 'date':
            return {
              string: (new Date(v.date.substr(0, 10))).toLocaleDateString(this.locale)
            }
            break
          case 'datetime':
            return {
              string: (new Date(v.datetime)).toLocaleString(this.locale)
            }
            break
          case 'integer':
            return {
              string: v.integer.toLocaleString(this.locale, { minimumFractionDigits: 0 })
            }
            break
          case 'decimal':
            return {
              string: v.decimal.toLocaleString(this.locale, { minimumFractionDigits: 2 })
            }
            break
          case 'reference':
            return {
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
              string: v.boolean ? this.$t('true') : this.$t('false')
            }
            break
          case 'string':
            return {
              string: v.string
            }
            break
          case 'text':
            return {
              string: v.string
            }
            break
          default:
            return v
            break
        }
      })
    }
  }
}
