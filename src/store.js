import { defineStore } from 'pinia'
import { apiGet } from '@/api'

export const useStore = defineStore('main', {
  state: () => ({
    locale: 'et',
    accounts: JSON.parse(sessionStorage.getItem('accounts')) || [],
    account: null,
    accountStats: {},
    activeRequests: 0,
    loadingBar: false
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
    },
    async getAccounts (key) {
      this.accounts = await apiGet('auth', {}, { Authorization: `Bearer ${key}` })

      sessionStorage.setItem('accounts', JSON.stringify(this.accounts))
    }
  }
})
