<script setup>
import { useLoadingBar, useNotification } from 'naive-ui'
import { useMainStore } from '~/stores/main'

const loadingBar = useLoadingBar()
const mainStore = useMainStore()
const { loading } = storeToRefs(mainStore)

watch(() => loading.value, (value) => {
  if (value) {
    loadingBar.start()
  } else {
    loadingBar.finish()
  }
})
</script>

<template>
  <slot />
</template>
