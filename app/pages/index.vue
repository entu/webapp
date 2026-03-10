<script setup>
import { NButton } from 'naive-ui'

const { t } = useI18n()
const { accounts, showMobileMenu } = useAccount()

onMounted(async () => {
  const path = accounts.value?.at(0)?._id

  if (!path) return

  await navigateTo({ path: `/${path}` })
})
</script>

<template>
  <div class="relative flex h-full flex-col">
    <!-- Changelog component -->
    <change-log class="absolute right-3 hidden max-w-80 md:block" />

    <div
      v-if="!accounts?.length"
      class="flex flex-1 items-center justify-center p-6"
    >
      <div class="flex w-64 flex-col gap-4">
        <div class="md:hidden">
          <n-button
            block
            size="large"
            type="info"
            @click="showMobileMenu = true"
          >
            {{ t('signIn') }}
          </n-button>
        </div>

        <n-button
          block
          secondary
          size="large"
          @click="navigateTo('/new')"
        >
          <my-icon
            class="mr-2"
            icon="add"
          />
          {{ t('new') }}
        </n-button>
      </div>
    </div>

    <div
      v-else
      class="relative flex h-full items-center justify-center"
    >
      <div class="flex w-64 flex-col gap-4">
        <div class="md:hidden">
          <n-button
            block
            size="large"
            type="info"
            @click="showMobileMenu = true"
          >
            {{ t('signIn') }}
          </n-button>
        </div>

        <n-button
          block
          secondary
          size="large"
          @click="navigateTo('/new')"
        >
          <my-icon
            class="mr-2"
            icon="add"
          />
          {{ t('new') }}
        </n-button>
      </div>
    </div>

    <div class="shrink-0 p-4 text-center text-sm text-gray-500">
      <a
        href="https://entu.ee/overview/"
        target="_blank"
      >{{ t('docs') }}</a>

      <span class="mx-2">&middot;</span>

      <a
        target="_blank"
        :href="t('pricingUrl')"
      >{{ t('pricing') }}</a>

      <span class="mx-2">&middot;</span>

      <a
        target="_blank"
        :href="t('termsUrl')"
      >{{ t('terms') }}</a>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    signIn: Sign In
    new: Create New Database
    docs: Documentation
    pricing: Pricing
    pricingUrl: https://entu.ee/#pricing
    terms: Terms of Service
    termsUrl: https://entu.ee/terms/
  et:
    signIn: Sisene
    new: Loo uus andmebaas
    docs: Dokumentatsioon
    pricing: Hinnad
    pricingUrl: https://entu.ee/#pricing
    terms: Kasutustingimused
    termsUrl: https://entu.ee/terms/
</i18n>
