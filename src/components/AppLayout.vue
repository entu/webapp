<script setup>
import { watch } from 'vue'
import { useLoadingBar, useNotification } from 'naive-ui'

import { useStore } from '@/store'

const store = useStore()
const loadingBar = useLoadingBar()
// const notification = useNotification()

watch(() => store.apiIsLoading, (value) => {
  if (value) {
    if (!store.loadingBar) {
      store.loadingBar = true
      loadingBar.start()
    }
  } else {
    loadingBar.finish()
    store.loadingBar = false
  }
}, { deep: true })
</script>

<template>
  <router-view />
</template>
