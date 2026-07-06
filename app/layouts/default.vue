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
</script>

<template>
  <div class="h-full">
    <!-- Desktop layout (≥ 768px): unchanged -->
    <n-layout
      v-if="!isMobile"
      class="size-full"
      has-sider
    >
      <n-layout-sider
        ref="siderRef"
        class="print:hidden!"
        collapse-mode="width"
        collapsed-trigger-class="top-7.5! text-white! bg-[#1E434C]! shaddow-none! border-white!"
        trigger-class="top-5! -left-1! text-white! opacity-80! bg-transparent! shaddow-none! border-transparent! hover:border-white!"
        :class="{ 'm-2 mr-0 rounded-2xl': !menuCollapsed }"
        :collapsed="menuCollapsed"
        :collapsed-width="60"
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
        <layout-toolbar class="m-2 shrink-0 print:hidden!" />

        <div
          v-if="isQuery && showTable"
          class="relative mb-2 min-h-0 grow"
        >
          <entity-table class="absolute inset-x-2 inset-y-0" />

          <my-drawer
            v-if="route.params.entityId"
            v-model:width="entityDrawerWidth"
            show
            @close="onDrawerClose"
          >
            <template #header>
              <div class="flex grow justify-end">
                <entity-actions :show-label="entityDrawerWidth >= 720" />
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
          class="relative mb-2 min-h-0 grow"
        >
          <n-split
            v-model:size="listWidth"
            class="absolute inset-0"
            direction="horizontal"
            pane1-class="print:hidden"
            pane2-class="py-2 grow overflow-y-auto"
            :max="0.5"
            :min="0.25"
          >
            <template #1>
              <entity-list />
            </template>

            <template #resize-trigger>
              <div class="h-full print:hidden">
                <div class="h-full w-0.5 bg-gray-300 hover:bg-gray-400" />
              </div>
            </template>

            <template #2>
              <slot />
            </template>
          </n-split>
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
          class="relative flex items-center bg-[#1E434C] px-3 pb-4 text-white print:hidden"
          style="padding-top: calc(env(safe-area-inset-top) + 1rem)"
        >
          <my-icon
            v-if="route.params.entityId && isQuery"
            class="cursor-pointer text-white opacity-80 hover:opacity-100"
            icon="arrow-left"
            style="font-size: 1.5rem"
            @click="navigateTo({ path: `/${accountId}`, query: route.query })"
          />
          <img
            v-else
            class="h-6 w-auto cursor-pointer"
            src="/logo.png"
            @click="navigateTo('/')"
          >

          <span class="pointer-events-none absolute inset-x-0 text-center font-medium">
            {{ account?.name || 'Entu' }}
          </span>

          <my-icon
            class="ml-auto cursor-pointer text-white opacity-80 hover:opacity-100"
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
            <layout-toolbar class="shrink-0 p-2" />

            <div
              v-if="route.params.entityId"
              class="grow overflow-y-auto py-2"
            >
              <slot />
            </div>

            <div
              v-else-if="isQuery"
              class="grow overflow-hidden"
            >
              <entity-list />
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
          <div class="flex h-full flex-col bg-[#1E434C]">
            <div class="flex items-center justify-between px-3 py-4">
              <div
                class="cursor-pointer text-sm text-white uppercase opacity-80 hover:opacity-100"
                @click="setMobileLanguage"
              >
                {{ langLabel }}
              </div>

              <my-icon
                class="cursor-pointer text-white opacity-80 hover:opacity-100"
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
