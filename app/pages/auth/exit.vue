<script setup>
import { NSpin } from 'naive-ui'

const { t } = useI18n()
const { logOut } = useUser()

onMounted(() => {
  useHead({ title: t('title') })

  logOut()
})
</script>

<template>
  <n-spin
    class="size-full"
    show
    :delay="1000"
  />
</template>

<i18n lang="yaml">
  en:
    title: Exit
  et:
    title: Välju
</i18n>
