<script setup>
import { NCard } from 'naive-ui'

definePageMeta({ layout: 'blank' })
const { t } = useI18n()

onMounted(async () => {
  useHead({ title: t('title') })
})
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <nuxt-link
      v-if="!menuCollapsed"
      :to="{ path: `/${account?._id || ''}` }"
    >
      <img
        class="mt-6 mb-4 mx-auto h-24 w-24"
        src="/logo.png"
      >
    </nuxt-link>

    <div class="w-2/6">
      <n-card
        :title="t('title')"
        class="w-80"
        closable
        @close="navigateTo({ path: '/' })"
      >
        Ut fugiat anim minim laborum. Magna qui pariatur nisi veniam est veniam irure proident nulla veniam aute magna nisi. Et esse sunt occaecat anim tempor consectetur aliquip nisi esse eu commodo excepteur velit reprehenderit. Duis anim fugiat ad consectetur nostrud aute ea ad sit Lorem laboris ex sit nulla. Officia anim elit labore amet sit elit exercitation laborum reprehenderit ad deserunt fugiat pariatur. Laborum eiusmod dolor ut reprehenderit magna non in nisi.
      </n-card>
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    title: Create a new database
  et:
    title: Loo uus andmebaas
</i18n>
