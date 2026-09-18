<script setup>
import DOMPurify from 'dompurify'
import { marked } from 'marked'

const props = defineProps({
  source: { type: String, default: undefined },
  newTab: { type: Boolean, default: false },
  internalLinks: { type: Boolean, default: false }
})

const md = computed(() => {
  const html = props.internalLinks
    ? plainExternalLinks(DOMPurify.sanitize(marked.parse(props.source)))
    : DOMPurify.sanitize(marked.parse(props.source))

  if (!props.newTab) return html

  return html.replaceAll('<a href', '<a target="_blank" rel="noopener" href')
})

// Turns links leaving this site into plain text showing the destination, so untrusted text can't become a one-click jump elsewhere
function plainExternalLinks (html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  for (const link of doc.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href')

    if (URL.canParse(href, window.location.origin) && new URL(href, window.location.origin).origin === window.location.origin) continue

    link.replaceWith(link.textContent === href ? href : `${link.textContent} (${href})`)
  }

  return doc.body.innerHTML
}
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
