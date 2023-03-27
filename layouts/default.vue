<script setup>
import { useLoadingBar } from 'naive-ui'

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
  <div>
    <slot />
  </div>
</template>
