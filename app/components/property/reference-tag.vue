<script setup>
const props = defineProps({
  entityId: { type: String, required: true },
  name: { type: String, default: undefined }
})

const route = useRoute()
const { accountId } = useAccount()

const { url } = useEntityThumbnail(() => props.entityId, 50)
</script>

<template>
  <my-tag :to="{ path: `/${accountId}/${entityId}`, query: route.query }">
    <template #avatar>
      <img
        v-if="url"
        class="size-5 rounded-full object-cover ring-1 ring-slate-900/10 dark:ring-white/10"
        :alt="name || entityId"
        :src="url"
      >
      <span
        v-else
        class="flex size-5 items-center justify-center rounded-full text-xs text-white ring-1 ring-slate-900/10 dark:ring-white/10"
        :style="{ backgroundColor: derivedColor(entityId) }"
      >
        {{ (name || entityId).at(0) }}
      </span>
    </template>

    {{ name || entityId }}
  </my-tag>
</template>
