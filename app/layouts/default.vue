<script setup>
import { NLayout, NLayoutSider, NSplit, NButton, NDrawer, NDrawerContent, useNotification } from 'naive-ui'

const nuxtApp = useNuxtApp()
const notification = useNotification()

const route = useRoute()
const { t } = useI18n()

const { account, accountId, showMobileMenu } = useAccount()
const { menuCollapsed, listWidth, showTable } = useUser()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const langLabel = computed(() => locale.value === 'en' ? 'Eesti keel' : 'English')

function setMobileLanguage () {
  setLocale(locale.value === 'en' ? 'et' : 'en')
  useAnalytics('click_language', { language: locale.value })
  reloadNuxtApp()
}

const { width: windowWidth } = useWindowSize()
const { isMobile } = useIsMobile()

watch(() => route.fullPath, () => {
  showMobileMenu.value = false
})

const siderRef = useTemplateRef('siderRef')
const isHovered = useElementHover(siderRef, { delayEnter: 200, delayLeave: 600 })

const entityDrawerWidth = ref(Math.round(window.innerWidth * 0.6))

const isQuery = computed(() => Object.keys(route.query).length > 0)

// The open entity's header color continues behind the toolbar, except in table view where the entity opens in a drawer.
const { headerGradient, headerTint } = useEntity()

const toolbarGradient = computed(() => route.params.entityId && (!(isQuery.value && showTable.value) || isMobile.value) ? headerGradient.value : undefined)

// Toolbar plus the entity title band, the height the entity color runs behind the side menu.
const HEADER_HEIGHT = 162
// How far the color dissolves below the band in list view.
const HEADER_FADE = 16
// Naive's default sider width plus the expanded menu's margin, and the collapsed width.
const MENU_COLUMN_WIDTH = 272 + 8
const MENU_COLLAPSED_WIDTH = 60

// With the list shown, the list is clear glass over one white-blended color, which also fills the side menu's margins.
const isSplit = computed(() => isQuery.value && !showTable.value)

// Color behind the side menu: the band's own gradient without the list (the title floats under the menu), the white-blended tint with it.
const menuStripStyle = computed(() => {
  if (!toolbarGradient.value) return

  if (!isSplit.value) {
    return {
      backgroundImage: toolbarGradient.value,
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      backgroundSize: `100% ${HEADER_HEIGHT}px`
    }
  }

  // White blend on top, then the menu column ending sharply at the band, then the list's tint dissolving below it.
  const white = 'color-mix(in srgb, var(--color-surface) 65%, transparent)'
  const menuWidth = menuCollapsed.value ? MENU_COLLAPSED_WIDTH : MENU_COLUMN_WIDTH
  const height = HEADER_HEIGHT + HEADER_FADE

  return {
    backgroundImage: [
      `linear-gradient(${white}, ${white})`,
      `linear-gradient(to bottom, ${headerTint.value} ${HEADER_HEIGHT}px, var(--color-surface) ${HEADER_HEIGHT}px)`,
      `linear-gradient(to bottom, ${headerTint.value} ${HEADER_HEIGHT}px, transparent)`
    ].join(', '),
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    backgroundSize: `100% ${height}px, ${menuWidth}px ${height}px, 100% ${height}px`
  }
})

let updateNotification
nuxtApp.hooks.hook('app:manifest:update', (a) => {
  if (updateNotification) return

  updateNotification = notification.info({
    content: t('updateContent'),
    meta: new Date(a.timestamp).toISOString().slice(0, 19).replace('T', ' '),
    action: () => h(NButton, {
      type: 'primary',
      round: true,
      secondary: true,
      strong: true,
      onClick: () => {
        useAnalytics('click_update')
        window.location.reload()
      }
    }, {
      default: () => t('updateBtn')
    })
  })
})

function changeMenu (collapsed) {
  useAnalytics('click_menu', { collapsed })
  menuCollapsed.value = collapsed
}

async function onDrawerClose () {
  await navigateTo({ path: `/${accountId.value}`, query: route.query })
}

const paletteStore = usePaletteStore()

function onPaletteKey (event) {
  if (!(event.metaKey || event.ctrlKey) || event.key?.toLowerCase() !== 'k') return
  if (!accountId.value) return

  event.preventDefault()
  paletteStore.toggle()
}

useEventListener(window, 'keydown', onPaletteKey)
</script>

<template>
  <div class="h-full">
    <!-- Desktop layout (≥ 768px) -->
    <n-layout
      v-if="!isMobile"
      class="size-full"
      has-sider
      :style="menuStripStyle"
    >
      <n-layout-sider
        ref="siderRef"
        class="relative z-10 shadow-[0_1px_24px_rgb(15_23_42/0.10)] ring-[0.5px] ring-slate-300/50 backdrop-blur-2xl dark:ring-slate-700/50 print:hidden!"
        collapse-mode="width"
        collapsed-trigger-class="top-7.5! border-0! bg-slate-900/5! text-slate-600! shadow-none! hover:bg-slate-900/10! dark:bg-white/5! dark:text-slate-300! dark:hover:bg-white/10!"
        trigger-class="top-5! -left-1! border-0! bg-slate-900/5! text-slate-600! shadow-none! hover:bg-slate-900/10! dark:bg-white/5! dark:text-slate-300! dark:hover:bg-white/10!"
        :class="{
          'm-2 mr-0 rounded-2xl': !menuCollapsed,
          'backdrop-saturate-150': !isSplit,
        }"
        :collapsed="menuCollapsed"
        :collapsed-width="MENU_COLLAPSED_WIDTH"
        :show-trigger="!menuCollapsed || isHovered ? 'arrow-circle' : undefined"
        @collapse="changeMenu(true)"
        @expand="changeMenu(false)"
      >
        <layout-side-menu :collapsed="menuCollapsed" />
      </n-layout-sider>

      <div
        v-if="accountId"
        class="flex grow flex-col overflow-hidden"
      >
        <layout-toolbar
          v-if="!isQuery || showTable"
          class="shrink-0"
          :gradient="toolbarGradient"
        />

        <div
          v-if="isQuery && showTable"
          class="relative min-h-0 grow"
        >
          <entity-table class="absolute inset-0" />

          <my-drawer
            v-if="route.params.entityId"
            v-model:width="entityDrawerWidth"
            show
            :header-style="headerGradient ? { backgroundImage: headerGradient, backgroundAttachment: 'fixed', borderBottom: 0 } : undefined"
            @close="onDrawerClose"
          >
            <template #header>
              <div class="flex grow justify-end">
                <entity-actions
                  :class="{ 'on-color': headerGradient }"
                  :show-label="entityDrawerWidth >= 720"
                />
              </div>
            </template>

            <slot />
          </my-drawer>

          <div
            v-else
            class="hidden"
          >
            <slot />
          </div>
        </div>

        <div
          v-else-if="isQuery"
          class="relative min-h-0 grow"
        >
          <n-split
            v-model:size="listWidth"
            class="absolute inset-0"
            direction="horizontal"
            pane1-class="flex flex-col backdrop-blur-2xl print:hidden"
            pane2-class="flex min-w-0 grow flex-col"
            :max="0.5"
            :min="0.25"
            :resize-trigger-size="1"
          >
            <template #1>
              <layout-toolbar
                class="shrink-0"
                part="search"
                :on-color="!!toolbarGradient"
              />
              <div class="min-h-0 grow">
                <entity-list />
              </div>
            </template>

            <template #resize-trigger>
              <div class="h-full print:hidden">
                <!-- A 1px line with a wider invisible grab area, so it stays easy to drag -->
                <div class="relative z-20 h-full w-px bg-slate-900/10 after:absolute after:-inset-x-1 after:inset-y-0 after:content-[''] hover:bg-slate-900/25 active:bg-slate-900/25 dark:bg-white/10 dark:hover:bg-white/25 dark:active:bg-white/25" />
              </div>
            </template>

            <template #2>
              <layout-toolbar
                class="shrink-0"
                part="actions"
                :gradient="toolbarGradient"
              />
              <div
                class="min-h-0 grow overflow-y-auto bg-surface"
                :class="{ 'py-2': !route.params.entityId }"
              >
                <slot />
              </div>
            </template>
          </n-split>
        </div>

        <div
          v-else
          class="grow overflow-y-auto bg-surface"
          :class="{ 'py-2': !route.params.entityId }"
        >
          <slot />
        </div>
      </div>

      <div
        v-else
        class="grow overflow-y-auto py-2"
      >
        <slot />
      </div>
    </n-layout>

    <!-- Mobile layout (< 768px): single-column stack navigation -->
    <template v-else>
      <div class="flex h-full flex-col">
        <!-- Mobile top bar -->
        <div
          class="relative flex items-center border-b border-slate-300/50 bg-slate-100 px-3 pb-4 text-slate-900 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-100 print:hidden"
          style="padding-top: calc(env(safe-area-inset-top) + 1rem)"
        >
          <my-icon
            v-if="route.params.entityId && isQuery"
            class="cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            icon="arrow-left"
            style="font-size: 1.5rem"
            @click="navigateTo({ path: `/${accountId}`, query: route.query })"
          />
          <img
            v-else
            class="h-6 w-auto cursor-pointer"
            src="/logo.svg"
            @click="navigateTo('/')"
          >

          <span class="pointer-events-none absolute inset-x-0 text-center font-medium">
            {{ account?.name || 'Entu' }}
          </span>

          <my-icon
            class="ml-auto cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            icon="menu"
            style="font-size: 1.5rem"
            @click="showMobileMenu = true"
          />
        </div>

        <!-- Content: show list OR detail, never both -->
        <div
          class="grow overflow-hidden"
          style="padding-bottom: env(safe-area-inset-bottom)"
        >
          <div
            v-if="accountId"
            class="flex h-full flex-col overflow-hidden"
          >
            <layout-toolbar
              class="shrink-0"
              :gradient="toolbarGradient"
            />

            <div
              v-if="route.params.entityId"
              class="grow overflow-y-auto pb-2"
            >
              <slot />
            </div>

            <div
              v-else-if="isQuery"
              class="grow overflow-hidden"
            >
              <entity-list />

              <!-- NuxtPage must stay mounted or route changes and #add drawers stop working -->
              <div class="hidden">
                <slot />
              </div>
            </div>

            <div
              v-else
              class="grow overflow-y-auto py-2"
            >
              <slot />
            </div>
          </div>

          <div
            v-else
            class="h-full overflow-y-auto py-2"
          >
            <slot />
          </div>
        </div>
      </div>

      <!-- Left-side nav overlay -->
      <n-drawer
        v-model:show="showMobileMenu"
        class="print:hidden"
        placement="right"
        :width="windowWidth"
      >
        <n-drawer-content body-content-class="p-0!">
          <div class="flex h-full flex-col bg-menu">
            <div class="flex items-center justify-between px-3 py-4">
              <div
                class="cursor-pointer text-sm font-semibold text-slate-600 uppercase hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                @click="setMobileLanguage"
              >
                {{ langLabel }}
              </div>

              <my-icon
                class="cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                icon="menu"
                style="font-size: 1.5rem"
                @click="showMobileMenu = false"
              />
            </div>

            <div class="grow overflow-y-auto">
              <layout-side-menu
                :collapsed="false"
                :show-lang="false"
              />
            </div>
          </div>
        </n-drawer-content>
      </n-drawer>
    </template>

    <chat-drawer />

    <palette-command-palette />
  </div>
</template>

<i18n lang="yaml">
  en:
    updateContent: A new version of the Entu is available.
    updateBtn: Refresh
  et:
    updateContent: Uus versioon Entust on saadaval.
    updateBtn: Värskenda
</i18n>
