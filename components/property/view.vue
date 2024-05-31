<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const props = defineProps({
  decimals: { type: Number, default: undefined },
  isMarkdown: { type: Boolean, default: false },
  values: { type: Array, required: true }
})

const { locale, d } = useI18n()
const { accountId } = useAccount()

const localeValues = computed(() => props.values.filter(x => !x.language || x.language === locale.value))
</script>

<template>
  <div
    v-for="v in localeValues"
    :key="v._id"
    class="my-1"
  >
    <template v-if="v.reference !== undefined && v.datetime !== undefined">
      <nuxt-link
        class="link"
        :to="{ path:`/${accountId}/${v.reference}`}"
      >
        {{ v.string }}
      </nuxt-link>
      <span class="ml-4 text-gray-500">
        {{ d(v.datetime, 'datetime') }}
      </span>
    </template>

    <template v-else-if="v.reference !== undefined && v.datetime === undefined">
      <nuxt-link
        class="link"
        :to="{ path:`/${accountId}/${v.reference}`}"
      >
        {{ v.string }}
      </nuxt-link>
    </template>

    <template v-else-if="v.filename !== undefined">
      <nuxt-link
        class="link"
        target="_blank"
        :to="{ path:`/${accountId}/file/${v._id}`}"
      >
        {{ v.filename || v._id }}
      </nuxt-link>

      <span
        v-if="v.filesize"
        class="ml-2"
      >
        {{ humanFileSize(v.filesize) }}
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
      {{ d(v.date, 'date') }}<br>
    </template>

    <template v-else-if="v.string !== undefined && !isMarkdown">
      {{ v.string }}
    </template>

    <template v-else-if="v.string !== undefined && isMarkdown">
      <my-markdown :source="v.string" />
    </template>

    <template v-else-if="v.number !== undefined && v.number !== null">
      {{ v.number.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) }}
    </template>

    <template v-else>
      {{ v }}
    </template>
  </div>
</template>
