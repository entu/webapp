<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

console.log(route.name, route.params)
</script>

<template>
  <div>Header</div>
  <div>List</div>
  <div>Entitry</div>
</template>
