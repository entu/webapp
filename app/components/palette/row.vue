<script setup>
const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: undefined },
  entityId: { type: String, default: undefined },
  entityName: { type: String, default: undefined },
  hasPhoto: { type: Boolean, default: false },
  detail: { type: String, default: undefined },
  keyHint: { type: String, default: undefined },
  selected: { type: Boolean, default: false },
  foldedQuery: { type: String, default: '' }
})

const emit = defineEmits(['select'])

const isEntity = computed(() => props.entityName !== undefined)

const initial = computed(() => (props.entityName || '?').trim().charAt(0).toUpperCase() || '?')
const avatarColor = computed(() => nameColor(props.entityName))

// Folded title with a map from each folded position back to its original character index.
const foldMap = computed(() => {
  const chars = [...props.title]
  const map = []
  let folded = ''

  for (const [index, char] of chars.entries()) {
    const foldedChar = paletteFold(char)

    for (let i = 0; i < foldedChar.length; i++) {
      map.push(index)
    }

    folded += foldedChar
  }

  return { chars, map, folded }
})

// Split the title at the first folded-query occurrence so the match renders bold.
const segments = computed(() => {
  if (!props.foldedQuery) return [{ text: props.title }]

  const { chars, map, folded } = foldMap.value
  const at = folded.indexOf(props.foldedQuery)

  if (at < 0) return [{ text: props.title }]

  const start = map.at(at)
  const end = map.at(at + props.foldedQuery.length - 1) + 1

  return [
    { text: chars.slice(0, start).join('') },
    { text: chars.slice(start, end).join(''), bold: true },
    { text: chars.slice(end).join('') }
  ].filter((x) => x.text)
})
</script>

<template>
  <div
    class="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1 text-sm"
    :class="{
      'bg-[#0071E3] text-white': selected,
      'hover:bg-black/5': !selected,
    }"
    @click="emit('select')"
  >
    <entity-avatar
      v-if="isEntity"
      class="size-6 shrink-0 rounded-md object-cover"
      :entity-id="entityId || ''"
      :has-photo="hasPhoto"
    >
      <div
        class="flex size-6 shrink-0 items-center justify-center rounded-md text-xs text-gray-600"
        :class="[avatarColor]"
      >
        {{ initial }}
      </div>
    </entity-avatar>

    <my-icon
      v-else-if="icon"
      class="w-4 shrink-0 text-sm"
      :class="{
        'text-white/80': selected,
        'text-gray-500': !selected,
      }"
      :icon="icon"
    />

    <div class="min-w-0 grow truncate">
      <template
        v-for="(segment, index) in segments"
        :key="index"
      >
        <strong
          v-if="segment.bold"
          class="font-semibold"
        >{{ segment.text }}</strong>
        <template v-else>
          {{ segment.text }}
        </template>
      </template>
    </div>

    <div
      v-if="detail"
      class="shrink-0 text-xs"
      :class="{
        'text-white/70': selected,
        'text-gray-400': !selected,
      }"
    >
      {{ detail }}
    </div>

    <span
      v-if="keyHint"
      class="inline-flex h-4 shrink-0 items-center rounded border px-1 text-xs leading-none font-medium"
      :class="{
        'border-white/40 text-white/85': selected,
        'border-gray-300 text-gray-500': !selected,
      }"
    >{{ keyHint }}</span>

    <span
      v-if="selected"
      class="inline-flex h-4 shrink-0 items-center rounded border border-white/40 px-1 text-xs leading-none font-medium text-white/85"
    >↩</span>
  </div>
</template>
