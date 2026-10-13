<script setup>
import { NPopover, NSpin } from 'naive-ui'

const props = defineProps({
  entityId: { type: String, default: null },
  value: { type: Object, required: true },
  decimals: { type: Number, default: undefined },
  isMarkdown: { type: Boolean, default: false },
  isName: { type: Boolean, default: false }
})

const route = useRoute()
const { locale, d, n, t } = useI18n()
const { accountId } = useAccount()

const PREVIEWABLE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'avif', 'heic', 'heif', 'pdf'
])

function isPreviewableExtension (filename) {
  if (!filename) {
    return false
  }

  const extension = filename.split('.').pop()?.toLowerCase()
  if (!extension) {
    return false
  }

  return PREVIEWABLE_EXTENSIONS.has(extension)
}

const isPreviewableFile = computed(() => {
  const filetype = props.value?.filetype

  if (filetype) {
    return filetype.startsWith('image/') || filetype === 'application/pdf'
  }

  return isPreviewableExtension(props.value?.filename)
})

const { url: thumbnailUrl, load: loadThumbnail } = usePropertyThumbnail(() => props.value?._id, 400)
const { url: thumbnailIconUrl, load: loadThumbnailIcon } = usePropertyThumbnail(() => props.value?._id, 50)

watch(isPreviewableFile, (previewable) => {
  if (previewable) {
    loadThumbnailIcon()
  }
}, { immediate: true })
</script>

<template>
  <template v-if="value.string !== undefined && isName && entityId">
    <nuxt-link
      class="link"
      :to="{ path: `/${accountId}/${entityId}`, query: route.query }"
    >
      {{ value.string }}
    </nuxt-link>
  </template>

  <template v-else-if="value.reference !== undefined && value.datetime !== undefined">
    <nuxt-link
      class="link"
      :to="{ path: `/${accountId}/${value.reference}`, query: route.query }"
    >
      {{ value.string }}
    </nuxt-link>
    <span class="ml-4 text-slate-600 dark:text-slate-300">
      {{ d(value.datetime, 'datetime') }}
    </span>
  </template>

  <template v-else-if="value.reference !== undefined && value.datetime === undefined">
    <nuxt-link
      class="link"
      :to="{ path: `/${accountId}/${value.reference}`, query: route.query }"
    >
      {{ value.string }}
    </nuxt-link>
  </template>

  <template v-else-if="value.filename !== undefined">
    <span class="flex items-center gap-2 leading-tight">
      <n-popover
        v-if="isPreviewableFile && thumbnailIconUrl"
        class="rounded-md bg-surface p-1 shadow-lg"
        placement="top"
        raw
        trigger="hover"
        @update:show="(show) => show && loadThumbnail()"
      >
        <template #trigger>
          <img
            class="size-5 shrink-0 rounded border border-slate-200 bg-slate-50 object-cover dark:border-slate-800 dark:bg-slate-900"
            :alt="value.filename || value._id"
            :src="thumbnailIconUrl"
          >
        </template>

        <img
          v-if="thumbnailUrl"
          class="max-h-64 max-w-64 rounded border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
          :alt="value.filename || value._id"
          :src="thumbnailUrl"
        >
        <div
          v-else
          class="flex size-24 items-center justify-center"
        >
          <n-spin size="small" />
        </div>
      </n-popover>

      <nuxt-link
        class="link"
        target="_blank"
        :to="{ path: `/${accountId}/file/${value._id}`, query: route.query }"
      >
        {{ value.filename || value._id }}
      </nuxt-link>

      <span
        v-if="value.filesize"
        class="text-sm text-slate-600 dark:text-slate-300"
      >
        {{ humanFileSize(n, value.filesize) }}
      </span>
    </span>
  </template>

  <template v-else-if="value.boolean !== undefined && value.boolean === true">
    <my-icon icon="checkmark" />
  </template>

  <template v-else-if="value.boolean !== undefined && value.boolean === false">
    <div />
  </template>

  <template v-else-if="value.datetime !== undefined">
    {{ d(value.datetime, 'datetime') }}
  </template>

  <template v-else-if="value.date !== undefined">
    {{ d(value.date, 'date') }}
  </template>

  <template v-else-if="value.provider !== undefined">
    <div class="flex items-center gap-2">
      <my-icon :icon="value.provider" />
      <span>{{ value.string }}</span>
    </div>
  </template>

  <template v-else-if="value.invite && value.string">
    <span class="text-sm text-slate-600 dark:text-slate-300">
      {{ t('invitePending', { email: value.string }) }}
    </span>
  </template>

  <template v-else-if="value.string !== undefined && !isMarkdown">
    {{ value.string }}
  </template>

  <template v-else-if="value.string !== undefined && isMarkdown">
    <my-markdown :source="value.string" />
  </template>

  <template v-else-if="value.number !== undefined && value.number !== null">
    {{ value.number.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) }}
  </template>

  <template v-else>
    {{ value }}
  </template>
</template>

<i18n lang="yaml">
  en:
    invitePending: 'Invite sent to {email}'
  et:
    invitePending: 'Kutse saadetud aadressile {email}'
</i18n>
