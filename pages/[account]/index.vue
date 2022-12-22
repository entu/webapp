<script setup>
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const { account } = storeToRefs(userStore)

useHead({ title: `Entu · ${account.value}` })

watch(() => account.value, () => useHead({ title: `Entu · ${account.value}` }))

</script>

<template>
  <div />
</template>
