<script setup>
import { computed, h, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon, NLayout, NLayoutContent, NLayoutSider, NMenu, NSpace, useLoadingBar, useNotification } from 'naive-ui'
import { Home as HomeIcon, Data2 as FolderIcon, Login as LoginIcon, Logout as LogoutIcon, Error as ErrorIcon } from '@vicons/carbon'

import { useStore } from '@/store'

const navCollapsed = ref(false)
const activeMenu = ref(location.search.substring(1))

const store = useStore()
const router = useRouter()
const route = useRoute()
const loadingBar = useLoadingBar()
const notification = useNotification()

store.account = route.params.account
store.getMenu()

const menu = computed(() => {
  const accounts = store.accounts.filter(x => x.account !== store.account).map(x => ({
    key: x.account,
    label: x.account,
    to: { name: 'account', params: { account: x.account } }
  }))

  const menu = store.menu.length
    ? store.menu.map(x => ({ ...x, icon: () => h(NIcon, null, () => h(FolderIcon)) }))
    : [{ key: 'no-menu', disabled: true, label: 'No public menu', icon: () => h(NIcon, null, () => h(ErrorIcon)) }]

  return [
    {
      key: 'account',
      label: store.account.toUpperCase(),
      icon: () => h(NIcon, null, () => h(HomeIcon)),
      to: { name: 'account', params: { account: store.account } },
      children: accounts.length ? accounts : null
    },
    {
      key: 'divider',
      type: 'divider',
      props: {
        style: {
          margin: '.7rem .5rem'
        }
      }
    },
    ...menu,
    {
      key: 'divider',
      type: 'divider',
      props: {
        style: {
          margin: '.7rem .5rem'
        }
      }
    },
    {
      key: 'auth',
      label: store.isAuthenticated ? 'Sign Out' : 'Sign In',
      icon: () => h(NIcon, null, () => h(store.isAuthenticated ? LogoutIcon : LoginIcon)),
      to: {
        name: 'auth',
        params: { id: store.isAuthenticated ? 'exit' : null }
      }
    }
  ]
})

watch(() => route.params.account, (value) => {
  store.account = route.params.account
  store.getMenu()
}, { deep: true })

watch(() => store.apiIsLoading, (value) => {
  if (value) {
    if (!store.loadingBar) {
      store.loadingBar = true
      loadingBar.start()
    }
  } else {
    loadingBar.finish()
    store.loadingBar = false
  }
}, { deep: true })

function onMenuUpdate (key, item) {
  if (item.to) {
    router.push(item.to)
  } else {
    router.push({ name: 'entity', params: { account: store.account, entity: '_' }, query: item.query })
  }
}
</script>

<template>
  <n-layout
    position="absolute"
    has-sider
  >
    <n-layout-sider
      bordered
      show-trigger="bar"
      content-style="padding:1rem 2px 0 0"
      collapse-mode="width"
      :collapsed-width="60"
      :collapsed="navCollapsed"
      :native-scrollbar="false"
      @collapse="navCollapsed = true"
      @expand="navCollapsed = false"
    >
      <n-space justify="center">
        <router-link to="/">
          <img
            src="@/assets/logo.png"
            :style="{
              height: navCollapsed ? '2rem' : '6rem'
            }"
          >
        </router-link>
      </n-space>
      <n-menu
        v-model:value="activeMenu"
        collapse-mode="width"
        :accordion="true"
        :collapsed="navCollapsed"
        :collapsed-width="60"
        :options="menu"
        :root-indent="18"
        :indent="32"
        @update:value="onMenuUpdate"
      />
    </n-layout-sider>
    <n-layout>
      <n-layout-content
        position="absolute"
        content-style="padding:1rem 1.3rem;height:100%;min-height:100%;display:flex;flex-direction:column;"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
</style>
