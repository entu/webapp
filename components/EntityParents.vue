<script setup>
import { ArrowUp as ArrowUpIcon } from '@vicons/carbon'

defineProps({
  account: { type: String, required: true },
  parents: { type: Array, required: true }
})
</script>

<template>
  <div class="flex items-center">
    <arrow-up-icon class="h-5 w-5 flex-none text-gray-400" />

    <div class="grow flex flex-wrap gap-3">
      <nuxt-link
        v-for="parent in parents"
        :key="parent._id"
        :to="{ path: `/${account}/${parent.reference}` }"
        class="grow text-center hover:text-green-800"
      >
        {{ parent.string }}
      </nuxt-link>
    </div>

    <arrow-up-icon class="h-5 w-5 flex-none text-gray-400" />
  </div>
</template>
