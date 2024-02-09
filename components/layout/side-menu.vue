<script setup>
import { NMenu } from 'naive-ui'
import { MyIcon, NuxtLink } from '#components'

const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })

const { accountId, accounts } = useAccount()
const { menuCollapsed, userId, userName } = useUser()

const menuStore = useMenueStore()
const { menuEntities } = storeToRefs(menuStore)

const expandedMenus = ref([])
const activeMenu = ref(window.location.search.substring(1))

const accountMenu = computed(() => {
  const menu = []
  const menuObject = {}

  if (accounts.value.length > 1) {
    menu.push({
      key: 'account',
      icon: () => h(MyIcon, { icon: 'home' }),
      label: (accountId.value || '').toUpperCase(),
      children: menuCollapsed.value
        ? [{
            name: '            1',
            label: () => h(NuxtLink,
              { to: { path: `/${accountId.value}` } },
              () => h('strong', {}, { default: () => (accountId.value || '').toUpperCase() })
            )
          }, {
            name: '            2',
            type: 'divider'
          },
          ...accounts.value.filter(x => x.account !== accountId.value).map(x => ({
            key: x.account,
            name: x.account,
            label: () => h(NuxtLink,
              { to: { path: `/${x.account}` } },
              { default: () => x.account }
            )
          }))
          ]
        : accounts.value.filter(x => x.account !== accountId.value).map(x => ({
          key: x.account,
          name: x.account,
          label: () => h(NuxtLink,
            {
              to: { path: `/${x.account}` },
              onClick: () => { expandedMenus.value = [] }
            },
            { default: () => x.account }
          )
        }))
    })

    menu.push({
      type: 'divider',
      props: { style: { margin: '.5rem' } }
    })
  } else if (menuEntities.value.length > 0) {
    menu.push({
      key: 'account',
      icon: () => h(MyIcon, { icon: 'home' }),
      label: () => h(NuxtLink,
        { to: { path: `/${accountId.value}` } },
        () => (accountId.value || '').toUpperCase()
      ),
      children: menuCollapsed.value
        ? [{
            name: '            1',
            label: () => h(NuxtLink,
              { to: { path: `/${accountId.value}` } },
              { default: () => h('strong', {}, { default: () => (accountId.value || '').toUpperCase() }) })
          }]
        : undefined
    })

    menu.push({
      type: 'divider',
      props: { style: { margin: '.5rem' } }
    })
  }

  menuEntities.value.forEach((entity) => {
    const group = getValue(entity.group)?.toLowerCase()
    const ordinal = getValue(entity.ordinal, 'number') || 0

    if (!menuObject[group]) {
      menuObject[group] = {
        key: group,
        icon: () => h(MyIcon, { icon: 'data' }),
        name: getValue(entity.group),
        label: getValue(entity.group),
        children: menuCollapsed.value
          ? [{
              name: '            1',
              label: () => h('strong', {}, { default: () => getValue(entity.group)?.toUpperCase() })
            }, {
              name: '            2',
              type: 'divider'
            }]
          : [],
        ordinal: 0
      }
    }

    menuObject[group].ordinal += ordinal
    menuObject[group].children.push({
      key: getValue(entity.query),
      name: getValue(entity.name),
      label: () => h(NuxtLink,
        { to: { path: `/${accountId.value}`, query: queryStringToObject(getValue(entity.query)) } },
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

const authMenu = computed(() => [
  {
    key: 'auth-apple',
    icon: () => h(MyIcon, { icon: 'apple' }),
    label: () => h(NuxtLink,
      { to: { path: '/auth/apple' } },
      { default: () => 'Apple' }
    )
  },
  {
    key: 'auth-google',
    icon: () => h(MyIcon, { icon: 'google' }),
    label: () => h(NuxtLink,
      { to: { path: '/auth/google' } },
      { default: () => 'Google' }
    )
  },
  {
    key: 'auth-sid',
    icon: () => h(MyIcon, { icon: 'smart-id' }),
    label: () => h(NuxtLink,
      { to: { path: '/auth/smart-id' } },
      { default: () => t('sid') }
    )
  },
  {
    key: 'auth-mid',
    icon: () => h(MyIcon, { icon: 'mobile-id' }),
    label: () => h(NuxtLink,
      { to: { path: '/auth/mobile-id' } },
      { default: () => t('mid') }
    )
  },
  {
    key: 'auth-idc',
    icon: () => h(MyIcon, { icon: 'id-card' }),
    label: () => h(NuxtLink,
      { to: { path: '/auth/id-card' } },
      { default: () => t('idc') }
    )
  }
])

const userMenu = computed(() => {
  const menu = []

  if (accountId.value && userId.value) {
    menu.push({
      key: userId.value,
      icon: () => h(MyIcon, { icon: 'user' }),
      label: () => h(NuxtLink,
        { to: { path: `/${accountId.value}/${userId.value}` } },
        { default: () => userName.value || t('userEntity') }
      )
    })
    menu.push({
      key: 'auth',
      icon: () => h(MyIcon, { icon: 'logout' }),
      label: () => h(NuxtLink,
        { to: { path: '/auth/exit' } },
        { default: () => t('signOut') }
      )
    })
  }

  menu.push({
    type: 'divider',
    props: { style: { margin: '.5rem' } }
  })

  menu.push({
    key: `language-${locale.value}`,
    icon: () => h(MyIcon, { icon: 'language' }),
    label: () => h('a',
      { onClick: () => setLanguage() },
      { default: () => t('language') }
    )
  })

  return menu
})

function setLanguage () {
  setLocale(locale.value === 'en' ? 'et' : 'en')
  reloadNuxtApp()
}

function menuSorter (a, b) {
  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) return -1
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) return 1

  if (!a.ordinal && b.ordinal) return -1
  if (a.ordinal && !b.ordinal) return 1

  if (!a.name || a.name < b.name) return -1
  if (!b.name || a.name > b.name) return 1

  return 0
}
</script>

<template>
  <div class="py-1 w-full min-h-full flex flex-col justify-between">
    <nuxt-link
      v-if="!menuCollapsed"
      :to="{ path: `/${accountId}` }"
    >
      <img
        class="mt-6 mb-4 mx-auto h-24 w-24"
        src="/logo.png"
      >
    </nuxt-link>

    <n-menu
      v-model:value="activeMenu"
      class="pb-0 grow"
      collapse-mode="width"
      :accordion="true"
      :collapsed-width="60"
      :collapsed="menuCollapsed"
      :expanded-keys="expandedMenus"
      :indent="32"
      :options="accountMenu"
      :root-indent="18"
      @update:expanded-keys="expandedMenus = $event"
    />

    <div
      v-if="!userId && !menuCollapsed"
      class="mt-8 text-white font-bold text-center"
    >
      {{ t('signIn') }}
    </div>

    <n-menu
      v-if="!userId"
      class="pb-0"
      collapse-mode="width"
      :accordion="true"
      :collapsed-width="60"
      :collapsed="menuCollapsed"
      :indent="32"
      :options="authMenu"
      :root-indent="18"
    />

    <n-menu
      v-model:value="activeMenu"
      class="pb-0"
      collapse-mode="width"
      :accordion="true"
      :collapsed-width="60"
      :collapsed="menuCollapsed"
      :indent="32"
      :options="userMenu"
      :root-indent="18"
    />
  </div>
</template>

<i18n lang="yaml">
  en:
    language: Eesti keel
    signIn: Sign In
    signOut: Sign Out
    mid: Mobile-ID
    sid: Smart-ID
    idc: ID-Card
    userEntity: User
  et:
    language: English
    signIn: Sisene
    signOut: Välju
    mid: Mobiil-ID
    sid: Smart-ID
    idc: ID-kaart
    userEntity: Kasutaja
</i18n>
