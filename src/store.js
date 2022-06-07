import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => ({
    locale: 'et',
    accounts: JSON.parse(sessionStorage.getItem('accounts')) || [],
    account: null,
    accountStats: {},
    activeRequests: 0,
    loadingBar: false,
    menu: []
  }),
  getters: {
    token (state) {
      return state.accounts.find(a => a.account === state.account)?.token
    },
    isAuthenticated (state) {
      return !!state.token
    },
    apiIsLoading (state) {
      return state.activeRequests > 0
    }
  },
  actions: {
    addActiveRequests (value) {
      this.activeRequests = this.activeRequests + value
    },
    logOut () {
      sessionStorage.clear()
      this.accounts = []
      this.account = null
      console.log('EXIT')
    },
    async apiGet (pathname, params, headers) {
      this.addActiveRequests(1)

      if (this.token && !headers) {
        headers = { Authorization: `Bearer ${this.token}` }
      }

      const url = new URL(import.meta.env.VITE_APP_API_URL)
      url.pathname = '/' + pathname
      url.search = new URLSearchParams(params).toString()

      const result = await fetch(url, { headers }).then(response => response.json())

      this.addActiveRequests(-1)

      return result
    },
    async getAccounts (key) {
      this.accounts = await this.apiGet('auth', {}, { Authorization: `Bearer ${key}` })

      sessionStorage.setItem('accounts', JSON.stringify(this.accounts))
    },
    async getAccountStats (key) {
      this.accountStats = await this.apiGet('account')
    },
    async getMenu (key) {
      const menu = {}
      const { entities } = await this.apiGet('entity', {
        account: this.account,
        '_type.string': 'menu',
        props: [
          'ordinal.integer',
          'group.string',
          'group.language',
          'name.string',
          'name.language',
          'query.string'
        ].join(',')
      })

      if (!entities) {
        return
      }

      entities.forEach(entity => {
        const group = getValue(entity.group, this.locale).toLowerCase()
        const ordinal = entity.ordinal ? entity.ordinal[0].integer : 0

        if (!menu[group]) {
          menu[group] = {
            key: group,
            label: getValue(entity.group, this.locale),
            children: [],
            ordinal: 0
          }
        }

        menu[group].ordinal += ordinal
        menu[group].children.push({
          key: getValue(entity.query, this.locale),
          label: getValue(entity.name, this.locale),
          query: queryObj(getValue(entity.query, this.locale)),
          ordinal
        })
      })

      this.menu = Object.values(menu)

      this.menu.forEach(m => {
        m.ordinal = m.ordinal / m.children.length
        m.children.sort(menuSorter)
      })

      this.menu.sort(menuSorter)
    }
  }
})

function getValue (valueList, locale) {
  if (!valueList) { return }

  const values = []

  valueList.forEach(v => {
    if (!v.language || v.language === locale) {
      values.push(v.string)
    }
  })

  return values[0]
}

function queryObj (q) {
  if (!q) { return {} }

  const query = q.split('&')

  const params = {}
  for (const parameter of query) {
    const p = parameter.split('=')
    params[p[0]] = p[1]
  }

  return params
}

function menuSorter (a, b) {
  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) { return -1 }
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) { return 1 }

  if (!a.ordinal && b.ordinal) { return -1 }
  if (a.ordinal && !b.ordinal) { return 1 }

  if (!a.name || a.name < b.name) { return -1 }
  if (!b.name || a.name > b.name) { return 1 }

  return 0
}
