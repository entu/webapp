<script setup>
defineProps({
  parents: { type: Array, required: true }
})

const { accountId } = useAccount()

</script>

<template>
  <div class="flex items-center">
    <icon-arrow-up class="h-5 w-5 flex-none text-gray-400" />

    <div class="grow flex flex-wrap gap-3">
      <nuxt-link
        v-for="parent in parents"
        :key="parent._id"
        :to="{ path: `/${accountId}/${parent.reference}` }"
        class="link grow text-center"
      >
        {{ parent.string }}
      </nuxt-link>
    </div>

    <icon-arrow-up class="h-5 w-5 flex-none text-gray-400" />
  </div>
</template>
