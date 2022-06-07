<script setup>
import { computed, h, defineProps, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon, NLayoutSider, NMenu, NSpace } from 'naive-ui'
import { Home as HomeIcon, Data2 as FolderIcon, Login as LoginIcon, Logout as LogoutIcon, Error as ErrorIcon } from '@vicons/carbon'

const router = useRouter()
const route = useRoute()

const navCollapsed = ref(false)
const activeMenu = ref(location.search.substring(1))

const props = defineProps({
  menu: {
    type: Array,
    default: null
  },
  accounts: {
    type: Array,
    default: null
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

const menu = computed(() => {
  const account = route.params.account

  const accounts = props.accounts.filter(x => x.account !== account).map(x => ({
    key: x.account,
    label: x.account,
    to: { name: 'account', params: { account: x.account } }
  }))

  const auth = props.isAuthenticated
    ? {
        key: 'auth',
        label: 'Sign Out',
        icon: () => h(NIcon, null, () => h(LogoutIcon)),
        to: { name: 'auth', params: { id: 'exit' } }
      }
    : {
        key: 'auth',
        label: 'Sign In',
        icon: () => h(NIcon, null, () => h(LoginIcon)),
        to: { name: 'auth' }
      }

  const menu = props.menu.length
    ? props.menu.map(x => ({
      ...x,
      icon: () => h(NIcon, null, () => h(FolderIcon))
    }))
    : [{
        key: 'no-menu',
        disabled: true,
        label: 'No public menu',
        icon: () => h(NIcon, null, () => h(ErrorIcon))
      }]

  return [
    {
      key: 'account',
      label: account.toUpperCase(),
      icon: () => h(NIcon, null, () => h(HomeIcon)),
      to: { name: 'account', params: { account } },
      children: accounts.length ? accounts : null
    },
    {
      key: 'divider1',
      type: 'divider',
      props: { style: { margin: '.7rem .5rem' } }
    },
    ...menu,
    {
      key: 'divider2',
      type: 'divider',
      props: { style: { margin: '.7rem .5rem' } }
    },
    auth
  ]
})

const toHome = computed(() => ({ name: route.name, params: route.params }))

watch(() => route.query, (value) => {
  activeMenu.value = location.search.substring(1)
})

function onMenuUpdate (key, item) {
  router.push(item.to || { name: 'entity', params: { account: route.params.account, entity: '_' }, query: item.query })
}
</script>

<template>
  <n-layout-sider
    bordered
    show-trigger="bar"
    content-style="padding:.3rem 2px 0 0"
    collapse-mode="width"
    :collapsed-width="60"
    :collapsed="navCollapsed"
    :native-scrollbar="false"
    @collapse="navCollapsed = true"
    @expand="navCollapsed = false"
  >
    <n-space justify="center">
      <router-link
        v-if="!navCollapsed"
        :to="toHome"
      >
        <img
          src="@/assets/logo.png"
          style="height:6rem;margin-top:1rem"
        >
      </router-link>
    </n-space>
    <n-menu
      v-model:value="activeMenu"
      collapse-mode="width"
      :options="menu"
      :accordion="true"
      :collapsed="navCollapsed"
      :collapsed-width="60"
      :root-indent="18"
      :indent="32"
      @update:value="onMenuUpdate"
    />
  </n-layout-sider>
</template>
