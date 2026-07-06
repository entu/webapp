<script setup>
const { t } = useI18n()

defineProps({
  stats: { type: Object, required: true },
  interactive: { type: Boolean, default: false }
})

const emit = defineEmits(['sort'])
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      :class="{ 'cursor-pointer': interactive }"
      @click="interactive && emit('sort', 'entities')"
    >
      <my-stats-bar
        color="rgb(23,162,184)"
        deleted-color="rgba(23,162,184,.3)"
        :deleted="stats.entities.deleted"
        :label="t('entities')"
        :limit="stats.entities.limit"
        :usage="stats.entities.usage"
      />
    </div>

    <div
      :class="{ 'cursor-pointer': interactive }"
      @click="interactive && emit('sort', 'properties')"
    >
      <my-stats-bar
        color="rgb(255,193,7)"
        deleted-color="rgba(255,193,7,.3)"
        :deleted="stats.properties.deleted"
        :label="t('properties')"
        :usage="stats.properties.usage"
      />
    </div>

    <div
      :class="{ 'cursor-pointer': interactive }"
      @click="interactive && emit('sort', 'files')"
    >
      <my-stats-bar
        color="rgb(40,167,69)"
        deleted-color="rgba(40,167,69,.3)"
        is-bytes
        :deleted="stats.files.deleted"
        :label="t('files')"
        :limit="stats.files.limit"
        :usage="stats.files.usage"
      />
    </div>

    <div
      :class="{ 'cursor-pointer': interactive }"
      @click="interactive && emit('sort', 'tokens')"
    >
      <my-stats-bar
        color="rgb(108,117,125)"
        deleted-color="rgba(108,117,125,.3)"
        show-total
        :label="t('tokens')"
        :limit="stats.tokens.limit"
        :usage="stats.tokens.usage"
      />
    </div>
  </div>
</template>

<i18n lang="yaml">
  en:
    entities: Entities
    properties: Properties
    files: Files
    tokens: AI tokens (in this month)
  et:
    entities: Objekte
    properties: Parameetreid
    files: Faile
    tokens: AI tokeneid (selles kuus)
</i18n>
