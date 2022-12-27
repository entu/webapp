<script setup>
import { useUserStore } from '~/stores/user'

const route = useRoute()
const userStore = useUserStore()
const { account } = storeToRefs(userStore)

definePageMeta({ key: () => 'entu', layout: 'menu' })
useHead({ title: `Entu · ${account.value}` })

onMounted(() => {
  !account.value && location.reload()
})

watch(() => account.value, () => useHead({ title: `Entu · ${account.value}` }))
</script>

<template>
  <div>
    {{ route.params.entityId }}
  </div>
</template>
