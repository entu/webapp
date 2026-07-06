<script setup>
import DOMPurify from 'dompurify'
import { marked } from 'marked'

const props = defineProps({
  source: { type: String, default: undefined },
  newTab: { type: Boolean, default: false }
})

const md = computed(() => {
  const html = DOMPurify.sanitize(marked.parse(props.source))

  if (!props.newTab) return html

  return html.replaceAll('<a href', '<a target="_blank" rel="noopener" href')
})
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

.markdown hr {
  @apply my-3 border-gray-200;
}

.markdown table {
  @apply my-3 border-collapse;
}

.markdown th,
.markdown td {
  @apply border border-gray-200 px-2 py-1 text-left;
}
</style>
