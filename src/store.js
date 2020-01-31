'use strict'

import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    locales: ['et', 'en'],
    locale: localStorage.getItem('locale') || 'et',
    background: 'bg-' + Math.ceil(Math.random() * 14),
    showMenu: document.body.clientWidth > 768,
    showList: document.body.clientWidth > 576,
    showEdit: false,
    activeRequests: 0,
    activeUploads: 0,
    activeMenu: null,
    newEntityId: null
  },
  getters: {
    locales: state => state.locales.filter(l => l !== state.locale),
    locale: state => state.locale,
    background: state => state.background,
    showMenu: state => state.showMenu,
    showList: state => state.showList,
    showEntity: state => !state.showList || document.body.clientWidth >= 576,
    showEdit: state => state.showEdit,
    activeRequests: state => state.activeRequests,
    activeUploads: state => state.activeUploads,
    activeMenu: state => state.activeMenu,
    newEntityId: state => state.newEntityId
  },
  mutations: {
    toggleMenu: (state, visible) => {
      state.showMenu = visible
    },
    toggleList: (state, visible) => {
      state.showList = visible
    },
    toggleEdit: (state, visible) => {
      state.showEdit = visible
    },
    setLocale: (state, locale) => {
      state.locale = locale
      localStorage.setItem('locale', locale)
    },
    setActiveRequests: (state, count) => {
      state.activeRequests += count
    },
    setActiveUploads: (state, count) => {
      state.activeUploads += count
    },
    setActiveMenu: (state, _id) => {
      state.activeMenu = _id
    },
    setNewEntityId: (state, _id) => {
      state.newEntityId = _id
    }
  }
})
