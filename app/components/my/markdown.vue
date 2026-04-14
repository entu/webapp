<script setup>
import { marked } from 'marked'

const props = defineProps({
  source: { type: String, default: null }
})

const md = computed(() => marked.parse(props.source))
</script>

<template>
  <div
    v-html="md"
    class="markdown"
  />
</template>

<style>
@reference "tailwindcss";

.markdown p {
  @apply mb-3 last-of-type:mb-0;
}

.markdown a {
  @apply underline;
}

.markdown ul {
  @apply list-disc pl-6;
}

.markdown ol {
  @apply list-decimal pl-6;
}
</style>
