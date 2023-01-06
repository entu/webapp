<script setup>
import { RouterLink } from 'vue-router'
import { NIcon, NMenu } from 'naive-ui'
import { Identification as IdentificationIcon, Home as HomeIcon, Data2 as FolderIcon, Logout as LogoutIcon, SimCard as SimCardIcon, User as UserIcon } from '@vicons/carbon'
import { LanguageOutline as LanguageOutlineIcon, LogoApple as LogoAppleIcon, LogoGoogle as LogoGoogleIcon, PhonePortraitOutline as PhonePortraitOutlineIcon } from '@vicons/ionicons5'

import { useMainStore } from '~/stores/main'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  collapsed: { type: Boolean, default: false }
})

const { t } = useI18n()
const mainStore = useMainStore()
const userStore = useUserStore()
const { language } = storeToRefs(mainStore)
const { _id, account, accounts, authenticated, name } = storeToRefs(userStore)

const menuEntities = ref([])
const activeMenu = ref(location.search.substring(1))

const accountMenu = computed(() => {
  const menu = []
  const menuObject = {}

  if (accounts.value.length > 1) {
    menu.push({
      key: 'account',
      icon: () => h(NIcon, null, () => h(HomeIcon)),
      label: (account.value || '').toUpperCase(),
      children: props.collapsed
        ? [{
            name: '            1',
            label: () => h(RouterLink,
              { to: { path: `/${account.value}` } },
              () => h('strong', {}, { default: () => (account.value || '').toUpperCase() })
            )
          }, {
            name: '            2',
            type: 'divider'
          },
          ...accounts.value.filter(x => x.account !== account.value).map(x => ({
            key: x.account,
            name: x.account,
            label: () => h(RouterLink,
              { to: { path: `/${x.account}` } },
              { default: () => x.account }
            )
          }))
          ]
        : accounts.value.filter(x => x.account !== account.value).map(x => ({
          key: x.account,
          name: x.account,
          label: () => h(RouterLink,
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
        icon: () => h(NIcon, null, () => h(FolderIcon)),
        name: getValue(entity.group),
        label: getValue(entity.group),
        children: props.collapsed
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
      label: () => h(RouterLink,
        { to: { path: `/${account.value}`, query: queryObj(getValue(entity.query)) } },
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
    disabled: true,
    icon: () => h(NIcon, null, () => h(LogoAppleIcon)),
    label: () => h(RouterLink,
      { to: { path: '' } },
      // { to: { path: '/auth/mobile-id' } },
      { default: () => 'Apple' }
    )
  },
  {
    key: 'auth-google',
    icon: () => h(NIcon, null, () => h(LogoGoogleIcon)),
    label: () => h(RouterLink,
      { to: { path: '/auth/google' } },
      { default: () => 'Google' }
    )
  },
  {
    key: 'auth-mid',
    disabled: true,
    icon: () => h(NIcon, null, () => h(SimCardIcon)),
    label: () => h(RouterLink,
      { to: { path: '' } },
      // { to: { path: '/auth/mobile-id' } },
      { default: () => t('mid') }
    )
  },
  {
    key: 'auth-sid',
    disabled: true,
    icon: () => h(NIcon, null, () => h(PhonePortraitOutlineIcon)),
    label: () => h(RouterLink,
      { to: { path: '' } },
      // { to: { path: '/auth/smart-id' } },
      { default: () => t('sid') }
    )
  },
  {
    key: 'auth-idc',
    disabled: true,
    icon: () => h(NIcon, null, () => h(IdentificationIcon)),
    label: () => h(RouterLink,
      { to: { path: '' } },
      // { to: { path: '/auth/id-card' } },
      { default: () => t('idc') }
    )
  }
])

const userMenu = computed(() => {
  const menu = []

  if (authenticated.value) {
    menu.push({
      key: _id.value,
      icon: () => h(NIcon, null, () => h(UserIcon)),
      label: () => h(RouterLink,
        { to: { path: `/${account.value}/${_id.value}` } },
        { default: () => name.value }
      )
    })
    menu.push({
      key: 'auth',
      icon: () => h(NIcon, null, () => h(LogoutIcon)),
      label: () => h(RouterLink,
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
    key: `language-${language.value}`,
    icon: () => h(NIcon, null, () => h(LanguageOutlineIcon)),
    label: () => h('a',
      { onClick: () => { language.value = language.value === 'en' ? 'et' : 'en' } },
      { default: () => t('language') }
    )
  })

  return menu
})

watch(() => account.value, () => getMenuEntities())

async function getMenuEntities () {
  if (!account.value) return

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

onMounted(getMenuEntities)
</script>

<template>
  <div class="py-2 min-h-full w-full flex flex-col justify-between">
    <nuxt-link
      v-if="!collapsed"
      :to="{ path: `/${account}` }"
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
      :collapsed="collapsed"
      :indent="32"
      :options="accountMenu"
      :root-indent="18"
    />
    <div
      v-if="!authenticated && !collapsed"
      class="mt-8 text-white font-bold text-center"
    >
      {{ t('signIn') }}
    </div>
    <n-menu
      v-if="!authenticated"
      class="pb-0"
      collapse-mode="width"
      :accordion="true"
      :collapsed-width="60"
      :collapsed="collapsed"
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
      :collapsed="collapsed"
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
