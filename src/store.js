'use strict'

import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    locales: ['et', 'en'],
    activeLocale: localStorage.getItem('locale') || 'et',
    activeRequests: 0
  },
  getters: {
    locales: state => state.locales.filter(l => l !== state.activeLocale),
    locale: state => state.activeLocale,
    requests: state => state.activeRequests
  },
  mutations: {
    setLocale: (state, locale) => {
      state.activeLocale = locale
      localStorage.setItem('locale', locale)
    },
    setRequests: (state, count) => {
      state.activeRequests += count
    }
  }
})
