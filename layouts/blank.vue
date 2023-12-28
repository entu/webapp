<script setup>
import { useLoadingBar } from 'naive-ui'

const loadingBar = useLoadingBar()
const requests = useRequestCounter()

const loading = computed(() => requests.value > 0)

watch(loading, (value) => {
  if (value) {
    loadingBar.start()
  } else {
    loadingBar.finish()
  }
})
</script>

<template>
  <div class="size-full">
    <slot />
  </div>
</template>
