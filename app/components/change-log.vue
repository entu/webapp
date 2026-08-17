<script setup>
import changelog from '~~/CHANGELOG.md?raw'

const { t } = useI18n()

// Drawer state
const showChangelogDrawer = ref(false)

function showAllChanges () {
  useAnalytics('show_changelog')
  showChangelogDrawer.value = true
}
</script>

<template>
  <span>
    <button
      class="cursor-pointer"
      @click="showAllChanges()"
    >{{ t('changelog') }}</button>

    <my-drawer
      v-model:show="showChangelogDrawer"
      closable
      :title="t('changelog')"
      :width="500"
      @close="showChangelogDrawer = false"
    >
      <my-markdown
        v-if="changelog"
        class="p-5"
        :source="changelog"
      />
    </my-drawer>
  </span>
</template>

<style scoped>
@reference "~/assets/tailwind.css";

:deep(h2) {
  @apply first-of-type:mt-0 mt-8 text-center text-lg font-semibold text-brand;
}

:deep(ul) {
  @apply pl-3;
}

:deep(li) {
  @apply mb-4 last-of-type:mb-0;
}
</style>

<i18n lang="yaml">
  en:
    changelog: Latest Changes
  et:
    changelog: Viimased muudatused
</i18n>
