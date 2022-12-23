<script setup>
import { useUserStore } from '~/stores/user'

const route = useRoute()
const userStore = useUserStore()
const { account } = storeToRefs(userStore)

const isQuery = computed(() => Object.keys(route.query).length > 0)

useHead({ title: `Entu · ${account.value}` })

onMounted(() => !account.value && location.reload())

watch(() => account.value, () => useHead({ title: `Entu · ${account.value}` }))
</script>

<template>
  <entity-list v-if="isQuery" />
</template>
