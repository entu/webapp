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
        :color="statColors.entities.color"
        :deleted="stats.entities.deleted"
        :deleted-color="statColors.entities.deletedColor"
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
        :color="statColors.properties.color"
        :deleted="stats.properties.deleted"
        :deleted-color="statColors.properties.deletedColor"
        :label="t('properties')"
        :usage="stats.properties.usage"
      />
    </div>

    <div
      :class="{ 'cursor-pointer': interactive }"
      @click="interactive && emit('sort', 'files')"
    >
      <my-stats-bar
        is-bytes
        :color="statColors.files.color"
        :deleted="stats.files.deleted"
        :deleted-color="statColors.files.deletedColor"
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
        show-total
        :color="statColors.tokens.color"
        :deleted-color="statColors.tokens.deletedColor"
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
