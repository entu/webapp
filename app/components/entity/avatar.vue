<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  entityId: { type: String, required: true },
  size: { type: Number, default: 50 },
  hasPhoto: { type: Boolean, default: false }
})

const { url } = useEntityThumbnail(() => props.hasPhoto ? props.entityId : undefined, () => props.size)
</script>

<template>
  <!-- Decorative: the entity's name is always shown next to it -->
  <img
    v-if="url"
    alt=""
    v-bind="$attrs"
    :src="url"
  >
  <slot v-else />
</template>
