<script setup>
import { NLayout, NLayoutSider, NSplit, NButton, NDrawer, NDrawerContent, useNotification } from 'naive-ui'

const nuxtApp = useNuxtApp()
const notification = useNotification()

const route = useRoute()
const { t } = useI18n()

const { account, accountId, showMobileMenu } = useAccount()
const { menuCollapsed, listWidth } = useUser()
const { locale, setLocale } = useI18n({ useScope: 'global' })
const langLabel = computed(() => locale.value === 'en' ? 'Eesti keel' : 'English')

function setMobileLanguage () {
  setLocale(locale.value === 'en' ? 'et' : 'en')
  useAnalytics('click_language', { language: locale.value })
  reloadNuxtApp()
}

const { width: windowWidth } = useWindowSize()
const isMobile = computed(() => windowWidth.value < 768)

watch(() => route.fullPath, () => {
  showMobileMenu.value = false
})

const siderRef = ref()
const isHovered = useElementHover(siderRef, { delayEnter: 200, delayLeave: 600 })

const showTable = ref(false)

const isQuery = computed(() => Object.keys(route.query).length > 0)

watch(listWidth, (value) => {
  if (value > 0.5 && !showTable.value) {
    useAnalytics('show_table')
    showTable.value = true
  }
  else if (value <= 0.5) {
    showTable.value = false
  }
}, { immediate: true })

let updateNotification
nuxtApp.hooks.hook('app:manifest:update', (a) => {
  if (updateNotification) return

  updateNotification = notification.info({
    content: t('updateContent'),
    meta: new Date(a.timestamp).toISOString().substring(0, 19).replace('T', ' '),
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
        class="print:hidden"
        collapse-mode="width"
        collapsed-trigger-class="!top-7.5 !text-white !bg-[#1E434C] !shaddow-none !border-white"
        trigger-class="!top-5 !-left-1 !text-white !opacity-80 !bg-transparent !shaddow-none !border-transparent hover:!border-white"
        :class="{ 'm-2 mr-0 rounded-md': !menuCollapsed }"
        :collapsed="menuCollapsed"
        :collapsed-width="60"
        :show-trigger="!menuCollapsed || isHovered ? 'arrow-circle' : undefined"
        @collapse="changeMenu(true)"
        @expand="changeMenu(false)"
      >
        <layout-side-menu :collapsed="menuCollapsed" />
      </n-layout-sider>

      <div
        v-if="accountId && isQuery"
        class="grow overflow-y-auto"
      >
        <n-split
          v-model:size="listWidth"
          direction="horizontal"
          :max="1"
          :min="0.25"
          :pane1-class="!menuCollapsed ? 'py-2 print:hidden' : 'print:hidden'"
          :pane2-class="!isQuery ? 'pl-4 py-2 grow overflow-y-auto' : 'py-2 grow overflow-y-auto'"
        >
          <template #1>
            <layout-entity-table v-if="showTable" />
            <layout-entity-list v-else />
          </template>

          <template #resize-trigger>
            <div
              class="h-full print:hidden"
              :class="menuCollapsed ? 'py-0' : 'py-2'"
            >
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
            style="font-size: 1.5rem"
            icon="arrow-left"
            @click="navigateTo({ path: `/${accountId}`, query: route.query })"
          />
          <img
            v-else
            src="/logo.png"
            class="h-6 w-auto cursor-pointer"
            @click="navigateTo('/')"
          >

          <span class="pointer-events-none absolute inset-x-0 text-center font-medium">
            {{ account?.name || 'Entu' }}
          </span>

          <my-icon
            class="ml-auto cursor-pointer text-white opacity-80 hover:opacity-100"
            style="font-size: 1.5rem"
            icon="menu"
            @click="showMobileMenu = true"
          />
        </div>

        <!-- Content: show list OR detail, never both -->
        <div
          class="grow overflow-hidden"
          style="padding-bottom: env(safe-area-inset-bottom)"
        >
          <layout-entity-table v-if="accountId && showTable && !route.params.entityId" />
          <layout-entity-list v-else-if="accountId && isQuery && !route.params.entityId" />

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
        placement="right"
        :width="windowWidth"
      >
        <n-drawer-content body-content-class="!p-0">
          <div class="flex h-full flex-col bg-[#1E434C]">
            <div class="flex items-center justify-between px-3 py-4">
              <div
                class="cursor-pointer text-sm uppercase text-white opacity-80 hover:opacity-100"
                @click="setMobileLanguage"
              >
                {{ langLabel }}
              </div>

              <my-icon
                class="cursor-pointer text-white opacity-80 hover:opacity-100"
                style="font-size: 1.5rem"
                icon="menu"
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
