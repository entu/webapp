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
  <div class="h-full flex flex-col">
    <div class="grow flex justify-center items-center">
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
    </div>

    <div class="px-4 text-sm text-center">
      <a
        v-if="!isQuery && !entityId"
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
    termsUrl: https://www.entu.ee/en/terms
  et:
    new: Loo uus andmebaas
    terms: Kasutustingimused
    termsUrl: https://www.entu.ee/tingimused
</i18n>
