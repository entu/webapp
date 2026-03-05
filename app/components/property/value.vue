<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
defineProps({
  entityId: { type: String, default: null },
  value: { type: Object, required: true },
  decimals: { type: Number, default: undefined },
  isMarkdown: { type: Boolean, default: false },
  isName: { type: Boolean, default: false }
})

const { query } = useRoute()
const { locale, d, n, t } = useI18n()
const { accountId } = useAccount()
</script>

<template>
  <template v-if="value.string !== undefined && isName && entityId">
    <nuxt-link
      class="link"
      :to="{ path: `/${accountId}/${entityId}`, query }"
    >
      {{ value.string }}
    </nuxt-link>
  </template>

  <template v-else-if="value.reference !== undefined && value.datetime !== undefined">
    <nuxt-link
      class="link"
      :to="{ path: `/${accountId}/${value.reference}`, query }"
    >
      {{ value.string }}
    </nuxt-link>
    <span class="ml-4 text-gray-500">
      {{ d(value.datetime, 'datetime') }}
    </span>
  </template>

  <template v-else-if="value.reference !== undefined && value.datetime === undefined">
    <nuxt-link
      class="link"
      :to="{ path: `/${accountId}/${value.reference}`, query }"
    >
      {{ value.string }}
    </nuxt-link>
  </template>

  <template v-else-if="value.filename !== undefined">
    <nuxt-link
      class="link"
      target="_blank"
      :to="{ path: `/${accountId}/file/${value._id}`, query }"
    >
      {{ value.filename || value._id }}
    </nuxt-link>

    <span
      v-if="value.filesize"
      class="ml-2 text-sm text-slate-500"
    >
      {{ humanFileSize(n, value.filesize) }}
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
      <span>{{ value.email || value.string }}</span>
    </div>
  </template>

  <template v-else-if="value.invite !== undefined">
    <span class="text-sm text-gray-500">
      {{ t('invitePending', { date: new Date(parseInt(value._id.substring(0, 8), 16) * 1000).toLocaleString(locale) }) }}
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
    invitePending: 'Invite sent {date}'
  et:
    invitePending: 'Kutse saadetud {date}'
</i18n>
