<script setup>
import { NPopover, NSpin } from 'naive-ui'

const props = defineProps({
  value: { type: Object, required: true }
})

const route = useRoute()
const { n } = useI18n()
const { accountId } = useAccount()

const { url: previewUrl, load: loadPreview } = usePropertyThumbnail(() => props.value._id, 400)
const { url: iconUrl, load: loadIcon } = usePropertyThumbnail(() => props.value._id, 50)

watch(() => isPreviewableFile(props.value), (previewable) => {
  if (previewable) {
    loadIcon()
  }
}, { immediate: true })
</script>

<template>
  <my-tag
    target="_blank"
    :to="{ path: `/${accountId}/file/${value._id}`, query: route.query }"
  >
    <template
      v-if="iconUrl"
      #avatar
    >
      <n-popover
        class="rounded-md bg-surface p-1 shadow-lg"
        placement="top"
        raw
        trigger="hover"
        @update:show="(show) => show && loadPreview()"
      >
        <template #trigger>
          <img
            class="size-5 rounded-full object-cover ring-1 ring-slate-900/10 dark:ring-white/10"
            :alt="value.filename || value._id"
            :src="iconUrl"
          >
        </template>

        <img
          v-if="previewUrl"
          class="max-h-64 max-w-64 rounded border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
          :alt="value.filename || value._id"
          :src="previewUrl"
        >
        <div
          v-else
          class="flex size-24 items-center justify-center"
        >
          <n-spin size="small" />
        </div>
      </n-popover>
    </template>

    {{ value.filename || value._id }}<template v-if="value.filesize">
      · {{ humanFileSize(n, value.filesize) }}
    </template>
  </my-tag>
</template>
