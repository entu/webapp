<script setup>
import { NButton } from 'naive-ui'

const { t } = useI18n()
const { accounts } = useAccount()

onMounted(async () => {
  const path = accounts.value?.at(0)?._id

  if (!path) return

  await navigateTo({ path: `/${path}` })
})
</script>

<template>
  <div class="relative flex h-full flex-col items-center justify-center">
    <n-button
      secondary
      size="large"
      type="success"
      @click="navigateTo('/new')"
    >
      <my-icon
        class="mr-2"
        icon="add"
      />
      {{ t('new') }}
    </n-button>

    <div class="absolute inset-x-0 bottom-0 text-center text-sm text-gray-500">
      <a
        target="_blank"
        :href="t('termsUrl')"
      >{{ t('terms') }}</a>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    new: Create New Database
    terms: Terms of Service
    termsUrl: https://www.entu.app/terms
  et:
    new: Loo uus andmebaas
    terms: Kasutustingimused
    termsUrl: https://www.entu.app/et/tingimused
</i18n>
