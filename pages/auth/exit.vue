<script setup>
import { useUserStore } from '~/stores'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  useHead({ title: t('title') })

  userStore.signOut()
  router.push({ path: '/', query: {} })
})
</script>

<template>
  <div />
</template>

<i18n lang="yaml">
  en:
    title: Exit
  et:
    title: Välju
</i18n>
