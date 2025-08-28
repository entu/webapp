<script setup>
import changelog from '~~/CHANGELOG.md?raw'

const { t, d } = useI18n()

// Drawer state
const showChangelogDrawer = ref(false)

// Extract the latest changelog entry
const latestChangelogEntry = computed(() => {
  if (!changelog) return null

  const sections = changelog.split('## ').filter(Boolean)
  if (!sections.length) return null

  const firstSection = sections.at(0)
  const lines = firstSection.split('\n')
  const dateString = lines.at(0)
  const content = lines.slice(1).join('\n')

  const date = new Date(dateString)

  return { date, content }
})

function showAllChanges () {
  useAnalytics('click_changelog')

  showChangelogDrawer.value = true
}
</script>

<template>
  <div>
    <!-- Latest changelog entry in top right corner -->
    <div v-if="latestChangelogEntry">
      <div class="mb-2 flex items-center justify-between">
        <span class="truncate font-semibold text-[#1E434C]">
          {{ t('changelog') }}
        </span>
        <span class="text-sm text-slate-500">
          {{ d(latestChangelogEntry.date, 'date') }}
        </span>
      </div>

      <my-markdown
        class="text-sm"
        :source="latestChangelogEntry.content"
      />

      <div class="mt-3 text-center">
        <button
          class="link text-xs font-semibold"
          @click="showAllChanges()"
        >
          {{ t('showAllChanges') }}
        </button>
      </div>
    </div>

    <!-- Changelog drawer -->
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
  </div>
</template>

<style scoped>
:deep(h2) {
  @apply first-of-type:mt-0 mt-8 text-center text-lg font-semibold text-[#1E434C];
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
    showAllChanges: Show all changes
  et:
    changelog: Viimased muudatused - EN
    showAllChanges: Näita kõiki muudatusi
</i18n>
