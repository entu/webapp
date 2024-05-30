<script setup>
import { NMenu } from 'naive-ui'
import { MyIcon, NuxtLink } from '#components'

const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })

const { account, accounts } = useAccount()
const { menuCollapsed, token, userId, userName } = useUser()

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
      label: account.value?.name,
      children: menuCollapsed.value
        ? [{
            key: `account-${account.value?._id}`,
            name: '            1',
            label: () => h(NuxtLink,
              { to: { path: `/${account.value?._id}` } },
              () => h('strong', {}, { default: () => account.value?.name })
            )
          }, {
            name: '            2',
            type: 'divider'
          },
          ...accounts.value.filter(x => x._id !== account.value?._id).map(x => ({
            key: `account-${account.value?._id}-${x._id}`,
            name: x.name,
            label: () => h(NuxtLink,
              { to: { path: `/${x._id}` } },
              { default: () => x.name }
            )
          }))
          ]
        : accounts.value.filter(x => x._id !== account.value?._id).map(x => ({
          key: `account-${x._id}`,
          name: x.name,
          label: () => h(NuxtLink,
            {
              to: { path: `/${x._id}` },
              onClick: () => { expandedMenus.value = [] }
            },
            { default: () => x.name }
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
        { to: { path: `/${account.value?._id}` } },
        () => account.value?.name
      ),
      children: menuCollapsed.value
        ? [{
            key: `account-${account.value?._id}`,
            name: '            1',
            label: () => h(NuxtLink,
              { to: { path: `/${account.value?._id}` } },
              { default: () => h('strong', {}, { default: () => account.value?.name }) })
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
        key: `group-${group}`,
        icon: () => h(MyIcon, { icon: 'data' }),
        name: getValue(entity.group),
        label: getValue(entity.group),
        children: menuCollapsed.value
          ? [{
              key: `group-${group}-${entity.group}`,
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
      key: getValue(entity.query) || entity._id,
      name: getValue(entity.name),
      label: () => getValue(entity.query).startsWith('http') || getValue(entity.query).startsWith('/')
        ? h(NuxtLink, { class: 'flex items-center justify-between', to: linkReplace(getValue(entity.query)), target: '_blank' },
          () => [
            getValue(entity.name),
            h(MyIcon, { icon: 'external-link' })
          ])
        : h(NuxtLink, { to: { path: `/${account.value?._id}`, query: queryStringToObject(getValue(entity.query)) } },
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

  if (account.value?._id && userId.value) {
    menu.push({
      key: userId.value,
      icon: () => h(MyIcon, { icon: 'user' }),
      label: () => h(NuxtLink,
        { to: { path: `/${account.value?._id}/${userId.value}` } },
        { default: () => userName.value || t('userEntity') }
      ),
      children: menuCollapsed.value
        ? [{
            key: `user-${userId.value}`,
            name: '            1',
            label: () => h(NuxtLink,
              { to: { path: `/${account.value?._id}/${userId.value}` } },
              { default: () => h('strong', {}, { default: () => userName.value || t('userEntity') }) }
            )
          }, {
            type: 'divider',
            props: { style: { margin: '.5rem' } }
          }, {
            key: `language-${locale.value}`,
            label: () => h('a',
              { onClick: () => setLanguage() },
              { default: () => t('language') }
            )
          }]
        : undefined
    })
  }

  if (token.value) {
    menu.push({
      type: 'divider',
      props: { style: { margin: '.5rem' } }
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

function linkReplace (url) {
  return url
    .replace('{DATABASE}', account.value?._id)
    .replace('{LOCALE}', locale.value)
}
</script>

<template>
  <div class="py-1 w-full min-h-full flex flex-col justify-between">
    <div
      v-if="!menuCollapsed"
      class="mt-1 ml-2 mr-3 mb-6 flex items-center justify-end"
    >
      <div
        class="text-sm text-white opacity-80 uppercase cursor-pointer"
        @click="setLanguage()"
      >
        {{ t('language') }}
      </div>
    </div>

    <a
      v-if="!menuCollapsed"
      :href="`/${account?._id || ''}`"
    >
      <img
        class="mx-auto h-24 w-24"
        src="/logo.png"
      >
    </a>

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
      v-if="!token && !menuCollapsed"
      class="mt-8 text-white font-bold text-center"
    >
      {{ t('signIn') }}
    </div>

    <n-menu
      v-if="!token"
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
