<script setup>
import { NMenu } from 'naive-ui'
import { IconApple, IconData, IconGoogle, IconHome, IconIdCard, IconLanguage, IconLogout, IconMobileId, IconSmartId, IconUser, NuxtLink } from '#components'

const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })

const { accountId, accounts } = useAccount()
const { menuCollapsed, userId, userName } = useUser()

const menuEntities = ref([])
const activeMenu = ref(window.location.search.substring(1))

const accountMenu = computed(() => {
  const menu = []
  const menuObject = {}

  if (accounts.value.length > 1) {
    menu.push({
      key: 'account',
      icon: () => h(IconHome, { class: 'h-5 w-5' }),
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
            { to: { path: `/${x.account}` } },
            { default: () => x.account }
          )
        }))
    })

    menu.push({
      type: 'divider',
      props: { style: { margin: '.5rem' } }
    })
  }

  menuEntities.value.forEach((entity) => {
    const group = getValue(entity.group).toLowerCase()
    const ordinal = getValue(entity.ordinal, 'number') || 0

    if (!menuObject[group]) {
      menuObject[group] = {
        key: group,
        icon: () => h(IconData, { class: 'h-5 w-5' }),
        name: getValue(entity.group),
        label: getValue(entity.group),
        children: menuCollapsed.value
          ? [{
              name: '            1',
              label: () => h('strong', { }, { default: () => getValue(entity.group).toUpperCase() })
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
        { to: { path: `/${accountId.value}`, query: queryObj(getValue(entity.query)) } },
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
    icon: () => h(IconApple, { class: 'h-5 w-5' }),
    label: () => h(NuxtLink,
      { to: { path: '/auth/apple' } },
      { default: () => 'Apple' }
    )
  },
  {
    key: 'auth-google',
    icon: () => h(IconGoogle, { class: 'h-5 w-5' }),
    label: () => h(NuxtLink,
      { to: { path: '/auth/google' } },
      { default: () => 'Google' }
    )
  },
  {
    key: 'auth-mid',
    icon: () => h(IconMobileId, { class: 'h-5 w-5' }),
    label: () => h(NuxtLink,
      { to: { path: '/auth/mobile-id' } },
      { default: () => t('mid') }
    )
  },
  {
    key: 'auth-sid',
    icon: () => h(IconSmartId, { class: 'h-5 w-5' }),
    label: () => h(NuxtLink,
      { to: { path: '/auth/smart-id' } },
      { default: () => t('sid') }
    )
  },
  {
    key: 'auth-idc',
    icon: () => h(IconIdCard, { class: 'h-5 w-5' }),
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
      icon: () => h(IconUser, { class: 'h-5 w-5' }),
      label: () => h(NuxtLink,
        { to: { path: `/${accountId.value}/${userId.value}` } },
        { default: () => userName.value }
      )
    })
    menu.push({
      key: 'auth',
      icon: () => h(IconLogout, { class: 'h-5 w-5' }),
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
    icon: () => h(IconLanguage, { class: 'h-5 w-5' }),
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

watch(accountId, () => getMenuEntities(), { immediate: true })

async function getMenuEntities () {
  if (!accountId.value) return

  const { entities } = await apiGetEntities({
    '_type.string': 'menu',
    props: [
      'ordinal.number',
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
  if (a.ordinal && b.ordinal && a.ordinal < b.ordinal) return -1
  if (a.ordinal && b.ordinal && a.ordinal > b.ordinal) return 1

  if (!a.ordinal && b.ordinal) return -1
  if (a.ordinal && !b.ordinal) return 1

  if (!a.name || a.name < b.name) return -1
  if (!b.name || a.name > b.name) return 1

  return 0
}

function queryObj (q) {
  if (!q) return {}

  const query = q.split('&')

  const params = {}
  for (const parameter of query) {
    const p = parameter.split('=')
    params[p[0]] = p[1]
  }

  return params
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
      :indent="32"
      :options="accountMenu"
      :root-indent="18"
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
  et:
    language: English
    signIn: Sisene
    signOut: Välju
    mid: Mobiil-ID
    sid: Smart-ID
    idc: ID-kaart
</i18n>
