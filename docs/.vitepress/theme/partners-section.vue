<script setup>
import { useData } from 'vitepress'

const { isDark, frontmatter } = useData()
const partners = frontmatter.value.partners
</script>

<template>
  <div class="partners-grid">
    <span
      v-for="partner in partners"
      :key="partner.name"
      class="partner-item"
      :style="{ backgroundColor: isDark ? partner.darkColor : partner.color }"
    >{{ partner.name }}</span>
  </div>
</template>

<style scoped>
.partners-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 24px 0 48px;
}

.partner-item {
  padding: 6px 14px;
  border: none;
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
