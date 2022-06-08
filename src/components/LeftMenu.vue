<script setup>
import { computed, h, defineProps, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon, NLayoutSider, NMenu } from 'naive-ui'
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
    to: { name: 'stats', params: { account: x.account } }
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
  router.push(item.to || { name: 'stats', params: { account: route.params.account }, query: item.query })
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
    <div class="w-full">
      <router-link
        v-if="!navCollapsed"
        :to="toHome"
      >
        <img
          src="@/assets/logo.png"
          class="mt-6 mb-4 mx-auto h-24 w-24"
        >
      </router-link>
    </div>
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

<style scoped>
.n-layout-sider {
  background-color: rgba(30, 67, 76, 1);
}
</style>
