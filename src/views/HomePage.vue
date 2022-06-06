<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

router.push({ name: 'account', params: { account: 'entu' } })
</script>

<template>
  <div />
</template>
