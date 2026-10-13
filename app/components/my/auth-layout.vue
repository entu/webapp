<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: undefined },
  // A multi-column page (sign-up) gets up to three columns' width from the mobile breakpoint up
  wide: { type: Boolean, default: false }
})

// `language` fires just before the page reloads in the other language, so a page can keep what was typed
const emit = defineEmits(['language'])

const { t } = useI18n()
const { locale, setLocale } = useI18n({ useScope: 'global' })

function setLanguage () {
  emit('language')
  setLocale(locale.value === 'en' ? 'et' : 'en')
  reloadNuxtApp()
}
</script>

<template>
  <div class="flex min-h-full flex-col">
    <div class="flex w-full justify-end px-4 pt-4">
      <span
        class="cursor-pointer text-xs font-bold text-slate-500 uppercase"
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

    <div class="flex flex-col items-center gap-1 px-4 pb-18 text-center">
      <div class="text-xl font-semibold">
        {{ title }}
      </div>
      <div
        v-if="description"
        class="max-w-80 text-sm text-slate-500"
      >
        {{ description }}
      </div>
    </div>

    <div
      class="mb-8 flex w-full flex-col gap-8 px-4 sm:mx-auto sm:w-80"
      :class="{ 'md:w-full md:max-w-264': wide }"
    >
      <slot />
    </div>

    <my-footer class="mt-auto mb-4" />
  </div>
</template>

<i18n lang="yaml">
  en:
    language: Eesti keel
  et:
    language: English
</i18n>
