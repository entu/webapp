<script setup>
const props = defineProps({
  properties: {
    type: Array,
    default: null
  }
})
</script>

<template>
  <div
    v-for="(p, pidx) in properties"
    :key="p.name"
    class="grid grid-cols-3 gap-3 border-t border-gray-100"
    :class="{'border-t-0': pidx === 0 }"
  >
    <div class="py-1 text-right text-[#1E434C] font-medium uppercase">
      {{ p.label || p.name }}
    </div>
    <div class="col-span-2">
      <div
        v-for="v in p.values"
        :key="v._id"
        class="my-1"
      >
        {{ v.string }}
      </div>
    </div>
  </div>
</template>
