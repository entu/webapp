<script setup>
import { computed, h, defineProps, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { NIcon, NLayoutSider, NMenu } from 'naive-ui'
import { Home as HomeIcon, Data2 as FolderIcon, Login as LoginIcon, Logout as LogoutIcon, Error as ErrorIcon } from '@vicons/carbon'

import { getValue } from '@/api'

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

const entityMenu = computed(() => {
  if (!props.menu || props.menu.length === 0) {
    return [{
      key: 'no-menu',
      icon: () => h(NIcon, null, () => h(ErrorIcon)),
      label: 'No public menu',
      disabled: true
    }]
  }

  const menuObject = {}

  props.menu.forEach(entity => {
    const group = getValue(entity.group).toLowerCase()
    const ordinal = entity.ordinal ? entity.ordinal[0].integer : 0

    if (!menuObject[group]) {
      menuObject[group] = {
        key: group,
        icon: () => h(NIcon, null, () => h(FolderIcon)),
        label: getValue(entity.group),
        children: [],
        ordinal: 0
      }
    }

    menuObject[group].ordinal += ordinal
    menuObject[group].children.push({
      key: getValue(entity.query),
      label: () => h(RouterLink,
        { to: { name: 'entity', params: { account: route.params.account, entity: '_' }, query: queryObj(getValue(entity.query)) } },
        { default: () => getValue(entity.name) }
      ),
      ordinal
    })
  })

  const menuArray = Object.values(menuObject)

  menuArray.forEach(m => {
    m.ordinal = m.ordinal / m.children.length
    m.children.sort(menuSorter)
  })

  menuArray.sort(menuSorter)

  return menuArray
})

const fullMenu = computed(() => {
  const menu = []
  const account = route.params.account

  menu.push({
    key: 'account',
    icon: () => h(NIcon, null, () => h(HomeIcon)),
    label: props.accounts.length > 1
      ? account.toUpperCase()
      : () => h(RouterLink,
          { to: { name: 'stats', params: { account } } },
          { default: () => account.toUpperCase() }
        ),
    children: props.accounts.length > 1
      ? props.accounts.filter(x => x.account !== account).map(x => ({
        key: x.account,
        label: () => h(RouterLink,
          { to: { name: 'stats', params: { account: x.account } } },
          { default: () => x.account }
        )
      }))
      : null
  })

  menu.push({
    key: 'divider1',
    type: 'divider',
    props: { style: { margin: '.7rem .5rem' } }
  })

  entityMenu.value.forEach(m => {
    menu.push(m)
  })

  menu.push({
    key: 'divider2',
    type: 'divider',
    props: { style: { margin: '.7rem .5rem' } }
  })

  if (props.isAuthenticated) {
    menu.push({
      key: 'auth',
      icon: () => h(NIcon, null, () => h(LogoutIcon)),
      label: () => h('a',
        { href: '/auth/exit' },
        { default: () => 'Sign Out' }
      )
    })
  } else {
    menu.push({
      key: 'auth',
      icon: () => h(NIcon, null, () => h(LoginIcon)),
      label: () => h('a',
        { href: '/auth' },
        { default: () => 'Sign In' }
      )
    })
  }

  return menu
})

const toHome = computed(() => ({ name: 'stats', params: route.params }))

watch(() => route.query, (value) => {
  activeMenu.value = location.search.substring(1)
})

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
</script>

<template>
  <n-layout-sider
    bordered
    show-trigger="bar"
    content-style="padding:.3rem 2px 0 0"
    collapse-mode="width"
    :collapsed-width="60"
    :collapsed="navCollapsed"
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
      :options="fullMenu"
      :accordion="true"
      :collapsed="navCollapsed"
      :collapsed-width="60"
      :root-indent="18"
      :indent="32"
    />
  </n-layout-sider>
</template>

<style scoped>
.n-layout-sider {
  background-color: rgba(30, 67, 76, 1);
}
</style>
