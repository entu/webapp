<script setup>
import { NButtonGroup } from 'naive-ui'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: undefined },
  providerGroups: { type: Array, required: true },
  // Returns the route location a provider button navigates to
  providerRoute: { type: Function, required: true }
})

const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })

function setLanguage () {
  setLocale(locale.value === 'en' ? 'et' : 'en')
  reloadNuxtApp()
}
</script>

<template>
  <div class="flex min-h-full flex-col">
    <div class="flex w-full justify-end px-4 pt-4">
      <span
        class="cursor-pointer text-xs font-bold text-gray-500 uppercase"
        @click="setLanguage()"
      >
        {{ t('language') }}
      </span>
    </div>

    <div class="flex justify-center py-4">
      <a href="/">
        <img
          class="size-24"
          src="/logo.png"
        >
      </a>
    </div>

    <div class="flex flex-col items-center gap-1 px-4 pb-6 text-center">
      <div class="text-xl font-semibold">
        {{ title }}
      </div>
      <div
        v-if="description"
        class="max-w-72 text-sm text-gray-500"
      >
        {{ description }}
      </div>
    </div>

    <div class="mb-8 flex w-full flex-col gap-8 px-4 sm:mx-auto sm:w-72">
      <div class="flex flex-col gap-3">
        <n-button-group
          v-for="(group, index) in providerGroups"
          :key="index"
          class="flex! w-full flex-col"
          vertical
        >
          <my-button
            v-for="provider in group"
            :key="provider.id"
            class="w-full justify-start! px-6!"
            size="large"
            :icon="provider.icon"
            :label="t(provider.label)"
            @click="navigateTo(providerRoute(provider))"
          />
        </n-button-group>
      </div>

      <slot />
    </div>

    <my-footer class="mt-auto mb-4" />
  </div>
</template>

<style scoped>
/* Group corners match a standalone button's visible radius (half of the 2.5rem button height) */
.n-button-group :deep(.n-button) {
  border-radius: 0;
}

.n-button-group :deep(.n-button:first-child) {
  border-top-left-radius: 1.25rem;
  border-top-right-radius: 1.25rem;
}

.n-button-group :deep(.n-button:last-child) {
  border-bottom-left-radius: 1.25rem;
  border-bottom-right-radius: 1.25rem;
}
</style>

<i18n lang="yaml">
  en:
    language: Eesti keel
  et:
    language: English
</i18n>
