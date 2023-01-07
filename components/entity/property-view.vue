<script setup>
const props = defineProps({
  language: { type: String, required: true },
  account: { type: String, required: true },
  values: { type: Array, required: true }
})

const { n } = useI18n()

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
      {{ n(v.number) }}
    </template>

    <template v-else-if="v.boolean !== undefined && v.boolean === true">
      <nuxt-icon
        class="text-xl"
        name="carbon/Checkmark"
      />
    </template>

    <template v-else-if="v.string !== undefined">
      {{ v.string }}
    </template>

    <template v-else>
      {{ v }}
    </template>
  </div>
</template>
