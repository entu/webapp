<script setup>
defineProps({
  parents: { type: Array, required: true }
})

const { query } = useRoute()
const { accountId } = useAccount()
</script>

<template>
  <div class="flex items-center">
    <my-icon
      class="flex-none text-gray-400"
      icon="arrow-up"
    />

    <div class="flex grow gap-3">
      <nuxt-link
        v-for="parent in parents"
        :key="parent._id"
        :to="{ path: `/${accountId}/${parent.reference}`, query }"
        class="link flex-1 flex-nowrap overflow-hidden truncate whitespace-nowrap text-center"
      >
        {{ parent.string }}
      </nuxt-link>
    </div>

    <my-icon
      class="flex-none text-gray-400"
      icon="arrow-up"
    />
  </div>
</template>
