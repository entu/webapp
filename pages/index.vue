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
  <div class="size-full flex justify-center items-center">
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
</template>

<i18n lang="yaml">
  en:
    new: Create New Database
  et:
    new: Loo uus andmebaas
</i18n>
