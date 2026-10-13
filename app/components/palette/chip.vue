<script setup>
const { t } = useI18n()

const props = defineProps({
  kind: { type: String, default: undefined },
  label: { type: String, required: true },
  condition: { type: String, default: undefined },
  value: { type: String, default: undefined },
  descending: { type: Boolean, default: false }
})

const emit = defineEmits(['cycle', 'flip', 'remove'])

const conditionKeys = {
  is: 'paletteCondIs',
  isNot: 'paletteCondIsNot',
  contains: 'paletteCondContains',
  before: 'paletteCondBefore',
  after: 'paletteCondAfter'
}

const tintClass = computed(() => ({
  'bg-indigo-500/10 text-indigo-500': props.kind === 'sort',
  'bg-blue-900/15 text-blue-900 ring-1 ring-blue-900/35 ring-inset dark:bg-blue-300/15 dark:text-blue-300 dark:ring-blue-300/35': props.kind === 'draft',
  'bg-blue-900/10 text-blue-900 dark:bg-blue-300/10 dark:text-blue-300': !props.kind
}))
</script>

<template>
  <span
    class="flex max-w-full items-center gap-1 rounded-[7px] py-0.5 pr-1 pl-2 text-sm font-medium"
    :class="tintClass"
  >
    <button
      v-if="kind === 'sort'"
      class="cursor-pointer"
      type="button"
      @click="emit('flip')"
    >
      <my-icon
        class="text-[9px]"
        :icon="descending ? 'arrow-down' : 'arrow-up'"
      />
    </button>

    <span class="truncate">{{ label }}</span>

    <button
      v-if="condition"
      class="cursor-pointer opacity-65"
      type="button"
      @click="emit('cycle')"
    >
      {{ t(conditionKeys[condition]) }}
    </button>

    <span
      v-if="value"
      class="truncate"
    >{{ value }}</span>

    <button
      class="cursor-pointer opacity-65"
      type="button"
      @click="emit('remove')"
    >
      <my-icon
        class="text-[8px]"
        icon="close"
      />
    </button>
  </span>
</template>

<i18n lang="yaml">
  en:
    paletteCondIs: is
    paletteCondIsNot: is not
    paletteCondContains: contains
    paletteCondBefore: before
    paletteCondAfter: after
  et:
    paletteCondIs: on
    paletteCondIsNot: ei ole
    paletteCondContains: sisaldab
    paletteCondBefore: enne
    paletteCondAfter: pärast
</i18n>
