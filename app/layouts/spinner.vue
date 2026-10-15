<script setup>
import { NSpin } from 'naive-ui'

const { t } = useI18n()
</script>

<template>
  <div class="size-full overflow-auto bg-[color-mix(in_oklab,var(--color-slate-50),white)] dark:bg-surface">
    <n-spin
      aria-hidden="true"
      class="size-full"
      show
      :delay="200"
    />
    <span
      class="sr-only"
      role="status"
    >{{ t('loading') }}</span>

    <slot />
  </div>
</template>

<i18n lang="yaml">
  en:
    loading: Loading…
  et:
    loading: Laadimine…
</i18n>
