<script setup>
const props = defineProps({
  account: { type: String, required: true },
  decimals: { type: Number, default: undefined },
  language: { type: String, required: true },
  values: { type: Array, required: true }
})

const localeValues = computed(() => props.values.filter(x => !x.language || x.language === props.language))
</script>

<template>
  <div
    v-for="v in localeValues"
    :key="v._id"
    class="my-1"
  >
    <!-- <pre class="text-xs">{{ v }}</pre> -->
    <template v-if="v.reference">
      <nuxt-link
        class="link"
        :to="{ path:`/${account}/${v.reference}`}"
      >
        {{ v.string }}
      </nuxt-link>
    </template>

    <template v-else-if="v.s3 !== undefined">
      <nuxt-link
        class="link"
        target="_blank"
        :to="{ path:`/${account}/file/${v._id}`}"
      >
        {{ v.filename || v._id }}
      </nuxt-link>

      <span
        v-if="v.filesize"
        class="ml-2 text-sm"
      >
        {{ humanFileSize(v.filesize) }}
      </span>
    </template>

    <template v-else-if="v.number !== undefined && v.number !== null">
      {{ v.number.toLocaleString(language, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) }}
    </template>

    <template v-else-if="v.boolean !== undefined && v.boolean === true">
      <icon-checkmark class="h-5 w-5" />
    </template>

    <template v-else-if="v.string !== undefined">
      {{ v.string }}
    </template>

    <template v-else>
      {{ v }}
    </template>
  </div>
</template>
