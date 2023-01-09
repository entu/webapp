<!-- eslint-disable vue/no-v-html -->
<script setup>
import { marked } from 'marked'

const props = defineProps({
  source: { type: String, default: null }
})

const md = computed(() => marked.parse(props.source))
</script>

<template>
  <div class="markdown" v-html="md" />
</template>

<style>
.markdown p {
  @apply mb-3 last-of-type:mb-0;
}
</style>
