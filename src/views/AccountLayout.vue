<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NMenu,
  NSpace,
  useLoadingBar,
  useNotification
} from 'naive-ui'

import { useStore } from '@/store'

const navCollapsed = ref(false)
const activeMenu = ref(location.search.substring(1))

const store = useStore()
const router = useRouter()
const route = useRoute()
const loadingBar = useLoadingBar()
const notification = useNotification()

store.account = route.params.account
store.getMenu()

watch(() => route.query, (value) => {
  activeMenu.value = location.search.substring(1)
})

watch(() => route.params.account, (value) => {
  store.account = value
})

watch(() => store.activeRequests.value, (value) => {
  if (value > 0) {
    loadingBar.start()
  } else {
    loadingBar.finish()
  }
})

function onMenuUpdate (key, item) {
  router.push({ name: 'entity', params: { account: store.account, entity: '_' }, query: item.query })
}
</script>

<template>
  <n-layout
    position="absolute"
    has-sider
  >
    <n-layout-sider
      bordered
      show-trigger="bar"
      content-style="padding-top:1rem;background:#fafafa"
      collapse-mode="width"
      :collapsed-width="64"
      :collapsed="navCollapsed"
      @collapse="navCollapsed = true"
      @expand="navCollapsed = false"
    >
      <n-space justify="center">
        <router-link to="/">
          <img
            src="@/assets/logo.png"
            :style="{
              height: navCollapsed ? '2rem' : '6rem'
            }"
          >
        </router-link>
      </n-space>
      <n-menu
        collapse-mode="width"
        :collapsed="navCollapsed"
        :collapsed-width="64"
        :options="store.menu"
        :value="activeMenu"
        @update:value="onMenuUpdate"
      />
    </n-layout-sider>
    <n-layout>
      <n-layout-content
        position="absolute"
        content-style="padding:1rem 1.3rem;height:100%;min-height:100%;display:flex;flex-direction:column;"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style>
#app {

}
</style>
