<script setup>
const route = useRoute()

watch(() => route.params.account, (value) => {
  console.log(value)
})
</script>

<template>
  <div />
</template>
