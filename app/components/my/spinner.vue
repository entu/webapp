<script setup>
import { NSpin } from 'naive-ui'

defineOptions({ inheritAttrs: false })

const { t } = useI18n()
</script>

<template>
  <!-- naive-ui's spinner names itself "loading" in English only, so it is hidden and a translated status is announced instead -->
  <span
    class="inline-flex"
    role="status"
  >
    <n-spin
      aria-hidden="true"
      v-bind="$attrs"
    />
    <span class="sr-only">{{ t('loading') }}</span>
  </span>
</template>

<i18n lang="yaml">
  en:
    loading: Loading…
  et:
    loading: Laadimine…
</i18n>
