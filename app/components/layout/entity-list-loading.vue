<script setup>
import { NProgress } from 'naive-ui'

const props = defineProps({
  isLoading: { type: Boolean, default: false },
  loadedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: null }
})

const { t } = useI18n()

const progressPercentage = computed(() => {
  if (!props.totalCount || props.totalCount === 0) return 0
  return Math.round((props.loadedCount / props.totalCount) * 100)
})
</script>

<template>
  <div class="sticky bottom-0 mx-auto w-full max-w-96 space-y-1 bg-gradient-to-t from-white to-transparent px-2 py-2.5 text-center">
    <div class="flex justify-between text-sm">
      <span
        v-if="totalCount === null"
        class="w-full text-center"
      >{{ t('loading') }}</span>

      <span
        v-else-if="totalCount === loadedCount"
        class="w-full text-center font-semibold"
      >{{ t('foundTotal', { total: totalCount }) }}</span>

      <template v-else>
        <span>{{ t('loadedCount', { loaded: loadedCount }) }}</span>
        <span class="font-semibold">{{ t('foundTotal', { total: totalCount }) }}</span>
      </template>
    </div>

    <n-progress
      v-if="totalCount > loadedCount"
      color="#4A6B75"
      status="info"
      type="line"
      :height="6"
      :percentage="progressPercentage"
      :show-indicator="false"
      :processing="isLoading || isLoadingOnScroll"
    />
  </div>
</template>

<i18n lang="yaml">
  en:
    loading: Loading...
    foundTotal: 'Found {total}'
    loadedCount: 'Loaded {loaded}'
  et:
    loading: Laadimine...
    foundTotal: 'Leiti {total}'
    loadedCount: 'Laaditud {loaded}'
</i18n>
