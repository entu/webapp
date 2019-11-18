'use strict'

import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    locales: ['et', 'en'],
    activeLocale: localStorage.getItem('locale') || 'et'
  },
  getters: {
    locales: state => state.locales.filter(l => l !== state.activeLocale),
    locale: state => state.activeLocale
  },
  mutations: {
    setLocale: (state, locale) => {
      state.activeLocale = locale
      localStorage.setItem('locale', locale)
    }
  }
})
