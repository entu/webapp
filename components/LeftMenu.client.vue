<script setup>
import { RouterLink } from 'vue-router'
import { NIcon, NMenu } from 'naive-ui'
import { Home as HomeIcon, Data2 as FolderIcon, Login as LoginIcon, Logout as LogoutIcon, Error as ErrorIcon } from '@vicons/carbon'

import { useUserStore } from '~/stores/user'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const userStore = useUserStore()
const { account, accounts, authenticated } = storeToRefs(userStore)

const menuEntities = ref([])
const activeMenu = ref(route.fullPath.split('?')[1])

const accountMenu = computed(() => {
  const menu = []
  const menuObject = {}

  if (accounts.value.length > 1) {
    menu.push({
      key: 'account',
      icon: () => h(NIcon, null, () => h(HomeIcon)),
      label: (account.value || '').toUpperCase(),
      children: accounts.value.filter(x => x.account !== account.value).map(x => ({
        key: x.account,
        label: () => h(RouterLink,
          { to: x.account },
          { default: () => x.account }
        )
      }))
    })

    menu.push({
      key: 'divider',
      type: 'divider',
      props: { style: { margin: '.5rem' } }
    })
  }

  menuEntities.value.forEach(entity => {
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
        { to: { path: account.value, query: queryObj(entity.query?.[0]?.string) } },
        { default: () => getValue(entity.name) }
      ),
      ordinal
    })
  })

  const menuArray = Object.values(menuObject).map(m => ({
    ...m,
    ordinal: m.ordinal / m.children.length,
    children: m.children.sort(menuSorter)
  })).sort(menuSorter)

  return [...menu, ...menuArray]
})

const signInMenu = computed(() => {
  const menu = []

  menu.push({
    key: 'divider',
    type: 'divider',
    props: { style: { margin: '.5rem' } }
  })

  if (authenticated.value) {
    menu.push({
      key: 'auth',
      icon: () => h(NIcon, null, () => h(LogoutIcon)),
      label: () => h(RouterLink,
        { to: 'auth/exit' },
        { default: () => 'Sign Out' }
      )
    })
  } else {
    menu.push({
      key: 'auth',
      icon: () => h(NIcon, null, () => h(LoginIcon)),
      label: () => h(RouterLink,
        { to: 'auth' },
        { default: () => 'Sign In' }
      )
    })
  }

  return menu
})

watch(() => account.value, value => {
  getMenu()
})

async function getMenu () {
  if (!account.value) return

  const { entities } = await apiGetEntities({
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

  menuEntities.value = entities
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

onMounted(() => {
  getMenu()
})
</script>

<template>
  <div class="min-h-full w-full flex flex-col justify-between">
    <div>
      <router-link
        v-if="!collapsed"
        :to="{ path: account || '' }"
      >
        <img
          class="mt-6 mb-4 mx-auto h-24 w-24"
          src="/logo.png"
        >
      </router-link>
      <n-menu
        v-model:value="activeMenu"
        collapse-mode="width"
        :accordion="true"
        :collapsed-width="60"
        :collapsed="collapsed"
        :indent="32"
        :options="accountMenu"
        :root-indent="18"
      />
    </div>

    <n-menu
      class="justify-self-end"
      collapse-mode="width"
      :accordion="true"
      :collapsed-width="60"
      :collapsed="collapsed"
      :indent="32"
      :options="signInMenu"
      :root-indent="18"
    />
  </div>
</template>
