<script setup>
defineProps({
  account: { type: String, required: true },
  parents: { type: Array, required: true }
})
</script>

<template>
  <div class="flex items-center">
    <nuxt-icon
      class="flex-none text-xl text-gray-400"
      name="carbon/ArrowUp"
    />

    <div class="grow flex flex-wrap gap-3">
      <nuxt-link
        v-for="parent in parents"
        :key="parent._id"
        :to="{ path: `/${account}/${parent.reference}` }"
        class="link grow text-center"
      >
        {{ parent.string }}
      </nuxt-link>
    </div>

    <nuxt-icon
      class="flex-none text-xl text-gray-400"
      name="carbon/ArrowUp"
    />
  </div>
</template>
