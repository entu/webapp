<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
const props = defineProps({
  decimals: { type: Number, default: undefined },
  isMarkdown: { type: Boolean, default: false },
  values: { type: Array, required: true }
})

const { locale } = useI18n()

const localeValues = computed(() => props.values.filter((x) => !x.language || x.language === locale.value))
</script>

<template>
  <div
    v-for="v in localeValues"
    :key="v._id"
    class="my-1"
  >
    <property-value
      :decimals="decimals"
      :is-markdown="isMarkdown"
      :value="v"
    />
  </div>
</template>
