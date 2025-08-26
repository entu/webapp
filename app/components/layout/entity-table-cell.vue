<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const props = defineProps({
  values: { type: Array, required: true },
  isName: { type: Boolean, default: false },
  entityId: { type: String, required: true },
  fallbackId: { type: String, default: null }
})

const { query } = useRoute()
const { locale, d, n } = useI18n()
const { accountId } = useAccount()

const localeValues = computed(() => {
  // If this is the name column and there are no values, use fallback _id
  if (props.isName && (!props.values || props.values.length === 0) && props.fallbackId) {
    return [{ string: props.fallbackId }]
  }

  return props.values.filter((x) => !x.language || x.language === locale.value)
})
</script>

<template>
  <div class="space-y-1">
    <div
      v-for="v in localeValues"
      :key="v._id || Math.random()"
      class="truncate"
    >
      <template v-if="v.reference !== undefined && v.datetime !== undefined">
        <nuxt-link
          class="text-sky-800 hover:underline"
          :to="{ path: `/${accountId}/${v.reference}`, query }"
        >
          {{ v.string }}
        </nuxt-link>
        <span class="ml-2 text-xs text-gray-500">
          {{ d(v.datetime, 'datetime') }}
        </span>
      </template>

      <template v-else-if="v.reference !== undefined && v.datetime === undefined">
        <nuxt-link
          class="text-sky-800 hover:underline"
          :to="{ path: `/${accountId}/${v.reference}`, query }"
        >
          {{ v.string }}
        </nuxt-link>
      </template>

      <template v-else-if="v.filename !== undefined">
        <nuxt-link
          class="text-sky-800 hover:underline"
          target="_blank"
          :to="{ path: `/${accountId}/file/${v._id}`, query }"
        >
          {{ v.filename || v._id }}
        </nuxt-link>

        <span
          v-if="v.filesize"
          class="ml-2 text-xs text-gray-500"
        >
          {{ humanFileSize(n, v.filesize) }}
        </span>
      </template>

      <template v-else-if="v.boolean !== undefined && v.boolean === true">
        <my-icon icon="checkmark" />
      </template>

      <template v-else-if="v.boolean !== undefined && v.boolean === false">
        <div />
      </template>

      <template v-else-if="v.datetime !== undefined">
        {{ d(v.datetime, 'datetime') }}
      </template>

      <template v-else-if="v.date !== undefined">
        {{ d(v.date, 'date') }}
      </template>

      <template v-else-if="v.string !== undefined && isName">
        <nuxt-link
          class="text-sky-800 hover:underline"
          :to="{ path: `/${accountId}/${entityId}`, query }"
        >
          {{ v.string }}
        </nuxt-link>
      </template>

      <template v-else-if="v.string !== undefined">
        {{ v.string }}
      </template>

      <template v-else-if="v.number !== undefined && v.number !== null">
        {{ v.number.toLocaleString(locale) }}
      </template>

      <template v-else>
        {{ v }}
      </template>
    </div>
  </div>
</template>
